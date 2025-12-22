import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useQuery } from "@apollo/client";
import { GET_APPOINTMENTS } from "../../src/graphql/queries/queries";
import { useNavigation } from "@react-navigation/native";
import ScreenNames from "../../src/navigation/ScreenNames";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AppointmentsListScreen() {
  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const { data, loading, refetch } = useQuery(GET_APPOINTMENTS, {
    notifyOnNetworkStatusChange: true,
  });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, [refetch]);

  const filteredAppointments =
    data?.appointments.filter((appt: any) => {
      const apptDate = new Date(appt.date);
      return (
        apptDate.getDate() === selectedDate.getDate() &&
        apptDate.getMonth() === selectedDate.getMonth() &&
        apptDate.getFullYear() === selectedDate.getFullYear()
      );
    }) || [];

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (loading && !data) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {showCalendar && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showCalendar}
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowCalendar(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="inline"
                themeVariant="light"
                textColor="black"
                onChange={(event, date) => {
                  if (date) {
                    setTempDate(date);
                  }
                }}
                style={styles.calendar}
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setSelectedDate(tempDate);
                  setShowCalendar(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <FlatList
        data={filteredAppointments}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Appointments</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate(ScreenNames.BookAppointment)}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.dateSelector}>
              <TouchableOpacity onPress={() => changeDate(-1)}>
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setTempDate(selectedDate);
                  setShowCalendar(true);
                }}
              >
                <Text style={styles.dateText}>
                  {selectedDate.toDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeDate(1)}>
                <Ionicons name="chevron-forward" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No Data</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate(ScreenNames.AppointmentDetails, {
                appointmentId: item.id,
              })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.doctorName}>
                {item.patient.firstName} {item.patient.lastName}
              </Text>
              <Text
                style={[styles.status, { color: getStatusColor(item.status) }]}
              >
                {item.status}
              </Text>
            </View>
            <Text style={styles.specialty}>Dr. {item.doctor.name}</Text>
            <Text style={styles.time}>
              {new Date(item.date).toDateString()} at {item.startTime} -{" "}
              {item.endTime}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "green";
    case "CANCELED":
      return "red";
    case "COMPLETED":
      return "blue";
    default:
      return "orange";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 20 },
  dateSelector: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: { fontSize: 16, fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  doctorName: { fontSize: 18, fontWeight: "bold" },
  specialty: { color: "#666", marginBottom: 5 },
  time: { fontSize: 14, fontWeight: "500" },
  status: { fontWeight: "bold" },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    color: "#999",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  calendar: {
    height: 350,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

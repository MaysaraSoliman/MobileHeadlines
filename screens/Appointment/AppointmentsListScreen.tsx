import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { useQuery } from "@apollo/client";
import { GET_APPOINTMENTS } from "../../src/graphql/queries/queries";
import { useNavigation } from "@react-navigation/native";
import ScreenNames from "../../src/navigation/ScreenNames";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default function AppointmentsListScreen() {
  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [tempDate, setTempDate] = useState(dayjs());
  const [showCalendar, setShowCalendar] = useState(false);
  const { data, loading, refetch } = useQuery(GET_APPOINTMENTS, {
    variables: { date: selectedDate.format("YYYY-MM-DD") },
    notifyOnNetworkStatusChange: true,
  });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, [refetch]);

  const appointments = data?.appointments || [];

  const changeDate = (days: number) => {
    setSelectedDate(selectedDate.add(days, "day"));
  };

  if (loading && !data) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {showCalendar && Platform.OS === "ios" && (
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
              <View>
                <DateTimePicker
                  value={tempDate.toDate()}
                  mode="date"
                  display="inline"
                  themeVariant="light"
                  textColor="black"
                  onChange={(event, date) => {
                    if (date) {
                      setTempDate(dayjs(date));
                    }
                  }}
                  style={styles.calendar}
                />
              </View>
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

      {showCalendar && Platform.OS === "android" && (
        <DateTimePicker
          value={selectedDate.toDate()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowCalendar(false);
            if (event.type === "set" && date) {
              setSelectedDate(dayjs(date));
            }
          }}
        />
      )}

      <FlatList
        data={appointments}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Appointments</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  navigation.navigate(ScreenNames.BookAppointmentScreen)
                }
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
                  {selectedDate.format("ddd MMM DD YYYY")}
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
                {item.company?.name || "No Company"}
              </Text>
              <Text
                style={[styles.status, { color: getStatusColor(item.status) }]}
              >
                {item.status}
              </Text>
            </View>
            <Text style={styles.specialty}>
              {item.person?.firstName} {item.person?.lastName}
            </Text>
            <Text style={styles.subText}>{item.user?.name}</Text>
            <Text style={styles.time}>
              {dayjs.utc(item.date).format("ddd MMM DD YYYY")} at{" "}
              {item.startTime} - {item.endTime}
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
  container: { flex: 1, backgroundColor: "#f4f4f4", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  addButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  dateText: { fontSize: 16, fontWeight: "bold" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: { marginTop: 10, color: "#888", fontSize: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  doctorName: { fontSize: 18, fontWeight: "bold" },
  status: { fontSize: 14, fontWeight: "bold" },
  specialty: { fontSize: 14, color: "#666", marginBottom: 5 },
  subText: { fontSize: 14, color: "#666", marginBottom: 5 },
  time: { fontSize: 12, color: "#888" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  calendar: {
    height: 350,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

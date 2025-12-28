import React, { useLayoutEffect, useState } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "@apollo/client/react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GET_APPOINTMENTS_BY_COMPANY } from "../../src/graphql/queries/queries";
import { RootStackParamList } from "../../src/navigation/NavigationTypes";
import ScreenNames from "../../src/navigation/ScreenNames";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { AppointmentItem } from "../../src/components/Appointment/AppointmentItem";
import { StatusSelectorModal } from "../../src/components/Appointment/StatusSelectorModal";
import { useAppointmentStatus } from "../../src/hooks/useAppointmentStatus";
import { AppointmentStatus } from "../../src/types/types";

dayjs.extend(utc);

type CompanyAppointmentsScreenRouteProp = RouteProp<
  RootStackParamList,
  ScreenNames.CompanyAppointmentsScreen
>;
type CompanyAppointmentsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  ScreenNames.CompanyAppointmentsScreen
>;

export default function CompanyAppointmentsScreen() {
  const navigation = useNavigation<CompanyAppointmentsScreenNavigationProp>();
  const route = useRoute<CompanyAppointmentsScreenRouteProp>();
  const { companyId, companyName } = route.params;

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [tempDate, setTempDate] = useState(dayjs());
  const [showCalendar, setShowCalendar] = useState(false);

  // Status Update Logic
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    status: AppointmentStatus;
  } | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const { updateStatus } = useAppointmentStatus();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Appointments",
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() =>
            navigation.navigate(ScreenNames.BookAppointmentScreen, {
              companyId,
              initialDate: selectedDate.toISOString(),
            } as any)
          }
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, companyId]);

  const { data, loading, error, refetch } = useQuery<any>(
    GET_APPOINTMENTS_BY_COMPANY,
    {
      variables: { companyId, date: selectedDate.format("YYYY-MM-DD") },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    }
  );

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error.message}</Text>;

  const appointments = data?.appointmentsByCompany || [];

  const changeDate = (days: number) => {
    setSelectedDate(selectedDate.add(days, "day"));
  };

  const handleStatusUpdate = (newStatus: AppointmentStatus) => {
    if (selectedAppointment) {
      updateStatus(selectedAppointment.id, newStatus);
      setStatusModalVisible(false);
      setSelectedAppointment(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <AppointmentItem
      item={item}
      onPress={() =>
        navigation.navigate(ScreenNames.AppointmentDetails, {
          appointmentId: item.id,
        })
      }
      onPressStatus={(status) => {
        setSelectedAppointment({ id: item.id, status });
        setStatusModalVisible(true);
      }}
    />
  );

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
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={refetch}
        ListHeaderComponent={
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
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              No appointments found for this company on this date.
            </Text>
          </View>
        }
      />

      <StatusSelectorModal
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        onSelectStatus={handleStatusUpdate}
        currentStatus={selectedAppointment?.status}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContainer: { padding: 15 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
    color: "#666",
    fontSize: 16,
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

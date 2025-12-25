import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  RefreshControl,
  Modal,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@apollo/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import Header from "../../src/components/Header/Header";
import { useAuth } from "../../src/context/AuthContext";
import ScreenNames from "../../src/navigation/ScreenNames";
import ScreenStacks from "../../src/navigation/ScreenStacks";
import { GET_APPOINTMENTS, GET_TASKS } from "../../src/graphql/queries/queries";
import { AppointmentItem } from "../../src/components/Appointment/AppointmentItem";
import { TaskItem } from "../../src/components/Task/TaskItem";
import { StatusSelectorModal } from "../../src/components/Appointment/StatusSelectorModal";
import { useAppointmentStatus } from "../../src/hooks/useAppointmentStatus";
import { AppointmentStatus } from "../../src/types/types";

dayjs.extend(utc);

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<"Appointments" | "Tasks">(
    "Appointments"
  );
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [tempDate, setTempDate] = useState(dayjs());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showOverdue, setShowOverdue] = useState(false);

  // Status Modal State
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string;
    status: AppointmentStatus;
  } | null>(null);

  const { updateStatus } = useAppointmentStatus();

  // Appointments Query
  const {
    data: appointmentsData,
    loading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useQuery(GET_APPOINTMENTS, {
    variables: { date: selectedDate.format("YYYY-MM-DD") },
    skip: activeTab !== "Appointments",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Tasks Query
  const {
    data: tasksData,
    loading: tasksLoading,
    refetch: refetchTasks,
  } = useQuery(GET_TASKS, {
    variables: {
      filter: {
        dueDate: selectedDate.format("YYYY-MM-DD"),
        // If showing overdue, we might want to adjust the filter, but typically overdue is a separate list or indicator.
        // For now let's just fetch for the date.
      },
    },
    skip: activeTab !== "Tasks",
    fetchPolicy: "cache-and-network",
  });

  useFocusEffect(
    useCallback(() => {
      if (activeTab === "Appointments") refetchAppointments();
      else refetchTasks();
    }, [activeTab, selectedDate, refetchAppointments, refetchTasks])
  );

  const handleDateChange = (direction: "prev" | "next") => {
    setSelectedDate((prev) =>
      direction === "prev" ? prev.subtract(1, "day") : prev.add(1, "day")
    );
  };

  const handleStatusUpdate = (newStatus: AppointmentStatus) => {
    if (!selectedAppointment) return;

    updateStatus(selectedAppointment.id, newStatus, () => {
      // Optional: Add specific success handling here if needed
    });

    setStatusModalVisible(false);
    setSelectedAppointment(null);
  };

  const renderAppointmentItem = ({ item }: { item: any }) => {
    return (
      <AppointmentItem
        item={item}
        onPress={() =>
          navigation.navigate(ScreenStacks.AppointmentsStack, {
            screen: ScreenNames.AppointmentDetails,
            params: {
              appointmentId: item.id,
            },
          })
        }
        onPressStatus={(status) => {
          setSelectedAppointment({
            id: item.id,
            status,
          });
          setStatusModalVisible(true);
        }}
      />
    );
  };

  const renderTaskItem = ({ item }: { item: any }) => (
    <TaskItem
      item={item}
      onPress={() =>
        navigation.navigate(ScreenNames.TaskDetailsScreen, { taskId: item.id })
      }
    />
  );

  const loading =
    activeTab === "Appointments" ? appointmentsLoading : tasksLoading;
  const data =
    activeTab === "Appointments"
      ? appointmentsData?.appointments
      : tasksData?.tasks;

  return (
    <View style={styles.container}>
      <Header userName={user?.name} />

      <View style={styles.dateNavigator}>
        <TouchableOpacity
          onPress={() => handleDateChange("prev")}
          style={styles.navButton}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateInfo}
          onPress={() => {
            setTempDate(selectedDate);
            setShowCalendar(true);
          }}
        >
          <Text style={styles.dateText}>
            {selectedDate.isValid()
              ? selectedDate.format("ddd, DD MMM YYYY")
              : "Invalid Date"}
          </Text>
          {selectedDate.isValid() && selectedDate.isSame(dayjs(), "day") && (
            <Text style={styles.todayText}>Today</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDateChange("next")}
          style={styles.navButton}
        >
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>

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
                  value={tempDate.isValid() ? tempDate.toDate() : new Date()}
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
          value={selectedDate.isValid() ? selectedDate.toDate() : new Date()}
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

      {/* Status Selection Modal */}
      <StatusSelectorModal
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        onSelectStatus={handleStatusUpdate}
        currentStatus={selectedAppointment?.status}
      />

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Appointments" && styles.activeTab]}
          onPress={() => setActiveTab("Appointments")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Appointments" && styles.activeTabText,
            ]}
          >
            Appointments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Tasks" && styles.activeTab]}
          onPress={() => setActiveTab("Tasks")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Tasks" && styles.activeTabText,
            ]}
          >
            Tasks
          </Text>
        </TouchableOpacity>
      </View>

      {/* Optional: Show Overdue Toggle could go here */}

      {loading ? (
        <ActivityIndicator style={styles.center} size="large" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={
            activeTab === "Appointments"
              ? renderAppointmentItem
              : renderTaskItem
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={
                activeTab === "Appointments"
                  ? refetchAppointments
                  : refetchTasks
              }
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={
                  activeTab === "Appointments"
                    ? "calendar-outline"
                    : "checkbox-outline"
                }
                size={64}
                color="#ccc"
              />
              <Text style={styles.emptyText}>
                No {activeTab.toLowerCase()} for this date
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dateNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  navButton: {
    padding: 5,
  },
  dateInfo: {
    alignItems: "center",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  todayText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
  },
  tabsContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#007AFF",
  },
  listContent: {
    padding: 10,
    paddingBottom: 80,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
  },
  specialty: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999",
  },
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

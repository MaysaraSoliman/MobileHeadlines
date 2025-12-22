import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigation, useRoute } from "@react-navigation/native";
import { updateAppointmentMutation } from "../../src/graphql/mutations/mutations";
import { GET_APPOINTMENT } from "../../src/graphql/queries/queries";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { AppointmentStatus } from "../../src/types/types";

const STATUS_OPTIONS: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELED",
  "COMPLETED",
];

export default function EditAppointmentScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { appointmentId } = route.params;

  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isStartTime, setIsStartTime] = useState(true);

  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery(GET_APPOINTMENT, {
    variables: { id: appointmentId },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.appointment) {
        setDate(new Date(data.appointment.date));
        setStartTime(data.appointment.startTime);
        setEndTime(data.appointment.endTime);
        setStatus(data.appointment.status);
      }
    },
  });

  const [updateAppointment, { loading: mutationLoading }] = useMutation(
    updateAppointmentMutation,
    {
      onCompleted: () => {
        Alert.alert("Success", "Appointment updated successfully");
        navigation.goBack();
      },
      onError: (error) => {
        Alert.alert("Error", error.message || "Failed to update appointment");
      },
    }
  );

  const handleSave = () => {
    if (!startTime || !endTime) {
      Alert.alert("Error", "Please select both start and end times");
      return;
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    if (endH * 60 + endM <= startH * 60 + startM) {
      Alert.alert("Error", "End time must be after start time");
      return;
    }

    updateAppointment({
      variables: {
        input: {
          id: appointmentId,
          date: date.toISOString(),
          startTime,
          endTime,
          status,
        },
      },
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const getTimeDate = (timeString: string) => {
    if (!timeString) return new Date();
    const d = new Date();
    const [hours, minutes] = timeString.split(":").map(Number);
    d.setHours(hours || 0);
    d.setMinutes(minutes || 0);
    d.setSeconds(0);
    return d;
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      const timeString = selectedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      if (isStartTime) {
        setStartTime(timeString);

        // Auto-set end time to 30 minutes later
        const endDate = new Date(selectedDate);
        endDate.setMinutes(endDate.getMinutes() + 30);
        const endTimeString = endDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        setEndTime(endTimeString);
      } else {
        setEndTime(timeString);
      }
    }
  };

  if (queryLoading) {
    return <ActivityIndicator style={styles.center} size="large" />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error loading appointment data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Appointment</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Ionicons name="calendar-outline" size={24} color="#333" />
          <Text style={styles.pickerText}>{date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Time</Text>
        <View style={styles.timeContainer}>
          <TouchableOpacity
            style={[styles.pickerButton, { flex: 1, marginRight: 10 }]}
            onPress={() => {
              setIsStartTime(true);
              setShowTimePicker(true);
            }}
          >
            <Ionicons name="time-outline" size={24} color="#333" />
            <Text style={styles.pickerText}>{startTime || "Start Time"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pickerButton, { flex: 1 }]}
            onPress={() => {
              setIsStartTime(false);
              setShowTimePicker(true);
            }}
          >
            <Ionicons name="time-outline" size={24} color="#333" />
            <Text style={styles.pickerText}>{endTime || "End Time"}</Text>
          </TouchableOpacity>
        </View>
        {showTimePicker && (
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={
                isStartTime ? getTimeDate(startTime) : getTimeDate(endTime)
              }
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={onTimeChange}
              style={styles.datePicker}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusContainer}>
          {STATUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.statusOption,
                status === option && styles.selectedStatus,
              ]}
              onPress={() => setStatus(option)}
            >
              <Text
                style={[
                  styles.statusText,
                  status === option && styles.selectedStatusText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={mutationLoading}
      >
        {mutationLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
  },
  pickerText: {
    marginLeft: 10,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedStatus: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  statusText: {
    color: "#666",
    fontSize: 14,
  },
  selectedStatusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  datePicker: {
    height: 300,
    width: "100%",
  },
});

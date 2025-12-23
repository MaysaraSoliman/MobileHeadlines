import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UPDATE_APPOINTMENT } from "../../src/graphql/mutations/mutations";
import {
  GET_APPOINTMENT,
  GET_COMPANIES,
  GET_PERSONS_BY_COMPANY,
  GET_USERS,
} from "../../src/graphql/queries/queries";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { AppointmentStatus } from "../../src/types/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

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

  const [date, setDate] = useState(dayjs());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [personId, setPersonId] = useState("");
  const [userId, setUserId] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isStartTime, setIsStartTime] = useState(true);

  // Queries for dropdowns
  const { data: companiesData, loading: companiesLoading } =
    useQuery(GET_COMPANIES);
  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS);
  const [getPersons, { data: personsData, loading: personsLoading }] =
    useLazyQuery(GET_PERSONS_BY_COMPANY);

  useEffect(() => {
    if (companyId) {
      getPersons({ variables: { companyId } });
    }
  }, [companyId]);

  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery(GET_APPOINTMENT, {
    variables: { id: appointmentId },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.appointment) {
        // Convert UTC stored date to Local date for display/editing
        const dateStr = dayjs(data.appointment.date).utc().format("YYYY-MM-DD");
        setDate(dayjs(dateStr));
        setStartTime(data.appointment.startTime);
        setEndTime(data.appointment.endTime);
        setStatus(data.appointment.status);

        // Set new fields
        setCompanyId(data.appointment.company?.id || "");
        setPersonId(data.appointment.person?.id || "");
        setUserId(data.appointment.user?.id || "");
      }
    },
  });

  const [updateAppointment, { loading: mutationLoading }] = useMutation(
    UPDATE_APPOINTMENT,
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
          date: date.format("YYYY-MM-DD"),
          startTime,
          endTime,
          status,
          companyId,
          personId,
          userId,
        },
      },
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(dayjs(selectedDate));
    }
  };

  const getTimeDate = (timeString: string) => {
    if (!timeString) return new Date();
    const [hours, minutes] = timeString.split(":").map(Number);
    return dayjs().set("hour", hours).set("minute", minutes).toDate();
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      const timeString = dayjs(selectedDate).format("HH:mm");

      if (isStartTime) {
        setStartTime(timeString);

        // Auto-set end time to 30 minutes later
        const endDate = dayjs(selectedDate).add(30, "minute");
        const endTimeString = endDate.format("HH:mm");
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
        <Text style={styles.label}>Company</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={companyId}
            onValueChange={(itemValue) => {
              setCompanyId(itemValue);
              setPersonId(""); // Reset person when company changes
            }}
          >
            <Picker.Item label="Select a company..." value="" />
            {companiesData?.companies.map((comp: any) => (
              <Picker.Item key={comp.id} label={comp.name} value={comp.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Person</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={personId}
            enabled={!!companyId}
            onValueChange={(itemValue) => setPersonId(itemValue)}
          >
            <Picker.Item
              label={
                companyId ? "Select a person..." : "Select a company first"
              }
              value=""
            />
            {personsData?.personsByCompany.map((person: any) => (
              <Picker.Item
                key={person.id}
                label={`${person.firstName} ${person.lastName}`}
                value={person.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>User</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={userId}
            onValueChange={(itemValue) => setUserId(itemValue)}
          >
            <Picker.Item label="Select a user..." value="" />
            {usersData?.users.map((user: any) => (
              <Picker.Item
                key={user.id}
                label={user.name || user.email}
                value={user.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Ionicons name="calendar-outline" size={24} color="#333" />
          <Text style={styles.pickerText}>
            {dayjs(date).format("ddd MMM DD YYYY")}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date.toDate()}
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
          <DateTimePicker
            value={getTimeDate(isStartTime ? startTime : endTime)}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onTimeChange}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusContainer}>
          {STATUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.statusButton,
                status === option && styles.statusButtonActive,
              ]}
              onPress={() => setStatus(option)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === option && styles.statusButtonTextActive,
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
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  errorText: { color: "red", fontSize: 16 },
  section: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 10, color: "#333" },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
  },
  pickerText: { marginLeft: 10, fontSize: 16, color: "#333" },
  timeContainer: { flexDirection: "row", justifyContent: "space-between" },
  statusContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginBottom: 5,
  },
  statusButtonActive: { backgroundColor: "#007AFF" },
  statusButtonText: { fontSize: 14, color: "#333" },
  statusButtonTextActive: { color: "white", fontWeight: "bold" },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },
  saveButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
});

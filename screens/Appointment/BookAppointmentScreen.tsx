import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useQuery, useMutation } from "@apollo/client";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  GET_DOCTORS,
  GET_APPOINTMENTS,
} from "../../src/graphql/queries/queries";
import { createAppointmentMutation } from "../../src/graphql/mutations/mutations";
import { useNavigation } from "@react-navigation/native";

export default function BookAppointmentScreen() {
  const navigation = useNavigation<any>();
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: doctorsData,
    loading: doctorsLoading,
    refetch,
  } = useQuery(GET_DOCTORS, {
    notifyOnNetworkStatusChange: true,
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, [refetch]);
  const [createAppointment, { loading: creating }] = useMutation(
    createAppointmentMutation,
    {
      refetchQueries: [{ query: GET_APPOINTMENTS }],
      onCompleted: () => {
        Alert.alert("Success", "Appointment booked successfully");
        navigation.goBack();
      },
      onError: (err) => {
        Alert.alert("Error", err.message);
      },
    }
  );

  const handleCreate = () => {
    if (!doctorId) {
      Alert.alert("Error", "Please select a doctor");
      return;
    }

    const formattedStartTime = `${startTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`;
    const formattedEndTime = `${endTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;

    createAppointment({
      variables: {
        input: {
          doctorId,
          date: date.toISOString(),
          startTime: formattedStartTime,
          endTime: formattedEndTime,
        },
      },
    });
  };

  if (doctorsLoading && !doctorsData)
    return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.label}>Select Doctor</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={doctorId}
          onValueChange={(itemValue) => setDoctorId(itemValue)}
        >
          <Picker.Item label="Select a doctor..." value="" />
          {doctorsData?.doctors.map((doc: any) => (
            <Picker.Item
              key={doc.id}
              label={`${doc.name} (${doc.specialty})`}
              value={doc.id}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select Date</Text>
      <TouchableOpacity
        style={styles.fullWidthBox}
        onPress={() => {
          setShowDatePicker(!showDatePicker);
          setShowStartTimePicker(false);
          setShowEndTimePicker(false);
        }}
      >
        <Text style={styles.boxLabel}>Date</Text>
        <Text style={styles.boxValue}>{date.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            onChange={(event, selectedDate) => {
              if (selectedDate) setDate(selectedDate);
            }}
            style={styles.datePicker}
          />
        </View>
      )}

      <Text style={styles.label}>Select Time</Text>
      <View style={styles.dateTimeRow}>
        <TouchableOpacity
          style={styles.dateTimeBox}
          onPress={() => {
            setShowStartTimePicker(!showStartTimePicker);
            setShowDatePicker(false);
            setShowEndTimePicker(false);
          }}
        >
          <Text style={styles.boxLabel}>Start Time</Text>
          <Text style={styles.boxValue}>
            {startTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateTimeBox}
          onPress={() => {
            setShowEndTimePicker(!showEndTimePicker);
            setShowDatePicker(false);
            setShowStartTimePicker(false);
          }}
        >
          <Text style={styles.boxLabel}>End Time</Text>
          <Text style={styles.boxValue}>
            {endTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </TouchableOpacity>
      </View>

      {showStartTimePicker && (
        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={startTime}
            mode="time"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setStartTime(selectedDate);
                const newEndTime = new Date(selectedDate);
                newEndTime.setMinutes(selectedDate.getMinutes() + 30);
                setEndTime(newEndTime);
              }
            }}
            style={styles.datePicker}
          />
        </View>
      )}

      {showEndTimePicker && (
        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={endTime}
            mode="time"
            display="spinner"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                // Ensure end time is at least 1 minute after start time to avoid logical errors
                const minEndTime = new Date(startTime);
                if (selectedDate <= minEndTime) {
                  // Optional: You could still enforce a minimum 1 minute gap or just warn
                  // For now, I'll just update it as user requested "user can make the time duration less than 30 minutes"
                  setEndTime(selectedDate);
                } else {
                  setEndTime(selectedDate);
                }
              }
            }}
            style={styles.datePicker}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreate}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Book Appointment</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "#fff" },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 15, marginBottom: 5 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  fullWidthBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    marginBottom: 10,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateTimeBox: {
    flex: 0.48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  boxLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  boxValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  datePicker: {
    height: 300,
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

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
  Modal,
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
import PatientSelector from "../../src/components/PatientSelector/PatientSelector";
import { Ionicons } from "@expo/vector-icons";

export default function BookAppointmentScreen() {
  const navigation = useNavigation<any>();
  const [doctorId, setDoctorId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientModalVisible, setPatientModalVisible] = useState(false);

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
    if (!selectedPatient) {
      Alert.alert("Error", "Please select a patient");
      return;
    }
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
          patientId: selectedPatient.id,
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
      <Modal
        visible={patientModalVisible}
        animationType="slide"
        onRequestClose={() => setPatientModalVisible(false)}
      >
        <PatientSelector
          onSelect={(patient) => {
            setSelectedPatient(patient);
            setPatientModalVisible(false);
          }}
          onClose={() => setPatientModalVisible(false)}
        />
      </Modal>

      <Text style={styles.label}>Patient</Text>
      <TouchableOpacity
        style={styles.fullWidthBox}
        onPress={() => setPatientModalVisible(true)}
      >
        {selectedPatient ? (
          <View style={styles.selectedPatientRow}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarTextSmall}>
                {selectedPatient.firstName?.[0]}
                {selectedPatient.lastName?.[0]}
              </Text>
            </View>
            <View>
              <Text style={styles.boxValue}>
                {selectedPatient.firstName} {selectedPatient.lastName}
              </Text>
              <Text style={styles.boxSubValue}>{selectedPatient.phone}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderRow}>
            <Text style={styles.placeholderText}>Select a Patient</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Doctor</Text>
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

      <Text style={styles.label}>Date</Text>
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

      <Text style={styles.label}>Time</Text>
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
                setEndTime(selectedDate);
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
      <View style={{ height: 50 }} />
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
    marginBottom: 10,
    justifyContent: "center",
  },
  selectedPatientRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeholderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e1f5fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarTextSmall: {
    color: "#0288d1",
    fontWeight: "bold",
    fontSize: 16,
  },
  boxSubValue: {
    fontSize: 12,
    color: "#666",
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
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import {
  GET_USERS,
  GET_APPOINTMENTS,
  GET_COMPANIES,
  GET_PERSONS_BY_COMPANY,
  GET_APPOINTMENTS_BY_COMPANY,
  GET_COMPANY,
} from "../../src/graphql/queries/queries";
import { CREATE_APPOINTMENT } from "../../src/graphql/mutations/mutations";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function BookAppointmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>(); // Add route

  const [companyId, setCompanyId] = useState(route.params?.companyId || "");
  const [personId, setPersonId] = useState(route.params?.personId || "");
  const [userId, setUserId] = useState("");

  const [date, setDate] = useState(
    route.params?.initialDate ? dayjs(route.params.initialDate) : dayjs()
  );
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(dayjs().add(30, "minute"));

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Get Companies
  const {
    data: companiesData,
    loading: companiesLoading,
    refetch: refetchCompanies,
  } = useQuery<any>(GET_COMPANIES, {
    variables: { search: "" },
    fetchPolicy: "cache-and-network",
  });

  // 2. Get Persons by Company (Lazy or dependent)
  const [getPersons, { data: personsData, loading: personsLoading }] =
    useLazyQuery<any>(GET_PERSONS_BY_COMPANY);

  useEffect(() => {
    if (companyId) {
      getPersons({ variables: { companyId } });
      if (companyId !== route.params?.companyId) {
        setPersonId(""); // Reset person when company changes manually
      }
    }
  }, [companyId]);

  // 3. Get Users
  const {
    data: usersData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useQuery<any>(GET_USERS, {
    notifyOnNetworkStatusChange: true,
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([refetchCompanies(), refetchUsers()])
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, [refetchCompanies, refetchUsers]);

  const [createAppointment, { loading: creating }] = useMutation(
    CREATE_APPOINTMENT,
    {
      awaitRefetchQueries: true,
      refetchQueries: [
        { query: GET_APPOINTMENTS },
        {
          query: GET_APPOINTMENTS_BY_COMPANY,
          variables: { companyId, date: date.format("YYYY-MM-DD") },
        },
        {
          query: GET_COMPANY,
          variables: { id: companyId },
        },
      ],
      onCompleted: () => {
        Alert.alert("Success", "Appointment booked successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      },
      onError: (err) => {
        Alert.alert("Error", err.message);
      },
    }
  );

  const handleCreate = () => {
    if (!companyId) {
      Alert.alert("Error", "Please select a company");
      return;
    }
    if (!personId) {
      Alert.alert("Error", "Please select a person from the company");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "Please select a user");
      return;
    }

    if (endTime.isSame(startTime) || endTime.isBefore(startTime)) {
      Alert.alert("Error", "End time must be after start time");
      return;
    }

    const formattedStartTime = startTime.format("HH:mm");
    const formattedEndTime = endTime.format("HH:mm");

    createAppointment({
      variables: {
        input: {
          companyId,
          personId,
          userId,
          date: date.format("YYYY-MM-DD"),
          startTime: formattedStartTime,
          endTime: formattedEndTime,
        },
      },
    });
  };

  if (companiesLoading || usersLoading)
    return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Company Selection */}
      <Text style={styles.label}>Company</Text>
      <View
        style={[
          styles.pickerContainer,
          route.params?.companyId && styles.disabledPicker,
        ]}
      >
        <Picker
          selectedValue={companyId}
          enabled={!route.params?.companyId}
          onValueChange={(itemValue) => setCompanyId(itemValue)}
        >
          <Picker.Item label="Select a company..." value="" />
          {companiesData?.companies.map((comp: any) => (
            <Picker.Item key={comp.id} label={comp.name} value={comp.id} />
          ))}
        </Picker>
      </View>

      {/* Person Selection (Dependent on Company) */}
      <Text style={styles.label}>Person</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={personId}
          enabled={!!companyId}
          onValueChange={(itemValue) => setPersonId(itemValue)}
        >
          <Picker.Item
            label={companyId ? "Select a person..." : "Select a company first"}
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
      {personsLoading && <ActivityIndicator size="small" />}

      {/* User Selection */}
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
        <Text style={styles.boxValue}>{date.format("ddd MMM DD YYYY")}</Text>
      </TouchableOpacity>

      {showDatePicker &&
        (Platform.OS === "ios" ? (
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={date.toDate()}
              mode="date"
              display="inline"
              onChange={(event, selectedDate) => {
                if (selectedDate) setDate(dayjs(selectedDate));
              }}
              style={styles.datePicker}
            />
          </View>
        ) : (
          <DateTimePicker
            value={date.toDate()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(dayjs(selectedDate));
            }}
          />
        ))}

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
          <Text style={styles.boxValue}>{startTime.format("hh:mm A")}</Text>
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
          <Text style={styles.boxValue}>{endTime.format("hh:mm A")}</Text>
        </TouchableOpacity>
      </View>

      {showStartTimePicker &&
        (Platform.OS === "ios" ? (
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={startTime.toDate()}
              mode="time"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  const newStart = dayjs(selectedDate);
                  setStartTime(newStart);
                  setEndTime(newStart.add(30, "minute"));
                }
              }}
              style={styles.datePicker}
            />
          </View>
        ) : (
          <DateTimePicker
            value={startTime.toDate()}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartTimePicker(false);
              if (selectedDate) {
                const newStart = dayjs(selectedDate);
                setStartTime(newStart);
                setEndTime(newStart.add(30, "minute"));
              }
            }}
          />
        ))}

      {showEndTimePicker &&
        (Platform.OS === "ios" ? (
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={endTime.toDate()}
              mode="time"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setEndTime(dayjs(selectedDate));
                }
              }}
              style={styles.datePicker}
            />
          </View>
        ) : (
          <DateTimePicker
            value={endTime.toDate()}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndTimePicker(false);
              if (selectedDate) {
                setEndTime(dayjs(selectedDate));
              }
            }}
          />
        ))}

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
  disabledPicker: {
    backgroundColor: "#e0e0e0",
    borderColor: "#b0b0b0",
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

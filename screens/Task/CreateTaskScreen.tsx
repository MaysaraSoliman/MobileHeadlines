import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useMutation, useQuery } from "@apollo/client/react";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { CREATE_TASK } from "../../src/graphql/mutations/mutations";
import { GET_USERS, GET_TASKS } from "../../src/graphql/queries/queries";
import dayjs from "dayjs";

// import { usePushNotifications } from "../../src/hooks/usePushNotifications";

export default function CreateTaskScreen() {
  const navigation = useNavigation<any>();
  // const { scheduleLocalNotification } = usePushNotifications();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedToId, setAssignedToId] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: usersData, loading: usersLoading } = useQuery<any>(GET_USERS);

  const [createTask, { loading: creating }] = useMutation<any>(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
    onCompleted: async () => {
      // await scheduleLocalNotification(
      //   "Task Created",
      //   `Task "${title}" has been created successfully.`
      // );
      Alert.alert("Success", "Task created successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err) => {
      Alert.alert("Error", err.message);
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    createTask({
      variables: {
        input: {
          title,
          description,
          priority,
          dueDate: dueDate.toISOString(),
          assignedToId: assignedToId || null,
          status: "PENDING",
        },
      },
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  if (usersLoading) return <ActivityIndicator style={styles.center} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Task Title"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Task Description"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityContainer}>
        {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.priorityButton,
              priority === p && styles.priorityButtonActive,
            ]}
            onPress={() => setPriority(p)}
          >
            <Text
              style={[
                styles.priorityText,
                priority === p && styles.priorityTextActive,
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Assign To</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={assignedToId}
          onValueChange={(itemValue) => setAssignedToId(itemValue)}
        >
          <Picker.Item label="Unassigned" value="" />
          {usersData?.users.map((user: any) => (
            <Picker.Item
              key={user.id}
              label={user.name || user.email}
              value={user.id}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Due Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(!showDatePicker)}
      >
        <Text style={styles.dateText}>
          {dayjs(dueDate).format("MMM DD, YYYY")}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <View style={styles.iosDatePickerContainer}>
          <DateTimePicker
            value={dueDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={onDateChange}
            style={Platform.OS === "ios" ? styles.iosDatePicker : undefined}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Create Task</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 15,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  priorityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  priorityButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "white",
  },
  priorityButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  priorityText: {
    color: "#333",
    fontSize: 14,
  },
  priorityTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  dateButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 50,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  iosDatePickerContainer: {
    alignItems: "center",
  },
  iosDatePicker: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
    width: "100%",
    flex: 1,
  },
});

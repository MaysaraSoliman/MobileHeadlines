import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_TASK, GET_TASKS } from "../../src/graphql/queries/queries";
import {
  DELETE_TASK,
  UPDATE_TASK,
} from "../../src/graphql/mutations/mutations";
import { RootStackParamList } from "../../src/navigation/NavigationTypes";
import ScreenNames from "../../src/navigation/ScreenNames";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";

type TaskDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  ScreenNames.TaskDetailsScreen
>;

export default function TaskDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<TaskDetailsScreenRouteProp>();
  const { taskId } = route.params;

  const { data, loading, error } = useQuery<any>(GET_TASK, {
    variables: { id: taskId },
    fetchPolicy: "cache-and-network",
  });

  const [updateTask] = useMutation<any>(UPDATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });

  const [deleteTask] = useMutation<any>(DELETE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
    onCompleted: () => {
      navigation.goBack();
    },
    onError: (err) => {
      Alert.alert("Error", err.message);
    },
  });

  const task = data?.task;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Task Details",
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 15 }} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, task]);

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTask({ variables: { id: taskId } });
        },
      },
    ]);
  };

  const handleStatusChange = (newStatus: string) => {
    updateTask({
      variables: {
        input: {
          id: taskId,
          status: newStatus,
        },
      },
    });
  };

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error.message}</Text>;
  if (!task) return <Text style={styles.center}>Task not found</Text>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "#ff9800";
      case "IN_PROGRESS":
        return "#2196f3";
      case "DONE":
        return "#4caf50";
      case "CANCELED":
        return "#f44336";
      default:
        return "#999";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "#f44336";
      case "HIGH":
        return "#ff5722";
      case "MEDIUM":
        return "#ff9800";
      case "LOW":
        return "#4caf50";
      default:
        return "#999";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              { backgroundColor: getStatusColor(task.status) },
            ]}
          >
            <Text style={styles.badgeText}>{task.status}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: getPriorityColor(task.priority) },
            ]}
          >
            <Text style={styles.badgeText}>{task.priority}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.text}>{task.description || "No description"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Due Date</Text>
        <Text style={styles.text}>
          {task.dueDate
            ? dayjs(task.dueDate).format("MMM DD, YYYY")
            : "No due date"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Assigned To</Text>
        <Text style={styles.text}>{task.assignedTo?.name || "Unassigned"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Created By</Text>
        <Text style={styles.text}>{task.createdBy?.name || "Unknown"}</Text>
      </View>

      <View style={styles.actions}>
        {task.status !== "DONE" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#4caf50" }]}
            onPress={() => handleStatusChange("DONE")}
          >
            <Text style={styles.actionButtonText}>Mark Done</Text>
          </TouchableOpacity>
        )}
        {task.status !== "IN_PROGRESS" && task.status !== "DONE" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#2196f3" }]}
            onPress={() => handleStatusChange("IN_PROGRESS")}
          >
            <Text style={styles.actionButtonText}>Start Task</Text>
          </TouchableOpacity>
        )}
        {task.status !== "CANCELED" && task.status !== "DONE" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#f44336" }]}
            onPress={() => handleStatusChange("CANCELED")}
          >
            <Text style={styles.actionButtonText}>Cancel Task</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  badges: {
    flexDirection: "row",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 10,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  actions: {
    marginTop: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

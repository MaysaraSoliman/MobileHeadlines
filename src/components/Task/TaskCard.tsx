import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { getPriorityColor, getTaskStatusColor } from "../../utils/taskUtils";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../../types/types";

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onStatusChange?: (status: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onStatusChange,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          <Text style={styles.date}>
            <Ionicons name="calendar-outline" size={12} color="#666" />{" "}
            {task.dueDate
              ? dayjs(task.dueDate).format("MMM DD, YYYY")
              : "No Due Date"}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.statusBadge,
            { backgroundColor: getTaskStatusColor(task.status) },
          ]}
          onPress={() => onStatusChange?.(task.status)}
          disabled={!onStatusChange}
        >
          <Text style={styles.statusText}>{task.status.replace("_", " ")}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {task.description || "No description provided."}
      </Text>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(task.priority) },
            ]}
          >
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>
        </View>

        <View style={styles.footerItem}>
          <Ionicons name="person-circle-outline" size={16} color="#666" />
          <Text style={styles.assigneeText}>
            {task.assignedTo?.name || "Unassigned"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#666",
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  assigneeText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
});

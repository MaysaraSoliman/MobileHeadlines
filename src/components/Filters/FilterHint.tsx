import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";

interface FilterHintProps {
  date: Date | null;
  selectedUser: { id: string; name: string } | null;
  onClearUser: () => void;
  onClearDate: () => void;
}

export const FilterHint: React.FC<FilterHintProps> = ({
  date,
  selectedUser,
  onClearUser,
  onClearDate,
}) => {
  const isAllTasks = !date && !selectedUser;

  if (isAllTasks) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Filtering by:</Text>
      <View style={styles.chipsContainer}>
        {date && (
          <View style={styles.chip}>
            <Ionicons name="calendar-outline" size={14} color="#007AFF" />
            <Text style={styles.chipText}>{dayjs(date).format("MMM D")}</Text>
            <TouchableOpacity onPress={onClearDate} style={styles.closeButton}>
              <Ionicons name="close-circle" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}

        {selectedUser && (
          <View style={styles.chip}>
            <Ionicons name="person-outline" size={14} color="#007AFF" />
            <Text style={styles.chipText}>
              {selectedUser.name.split(" ")[0]}
            </Text>
            <TouchableOpacity onPress={onClearUser} style={styles.closeButton}>
              <Ionicons name="close-circle" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f9ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
    fontWeight: "600",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#b3e5fc",
  },
  chipText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 4,
    fontWeight: "500",
  },
  closeButton: {
    marginLeft: 4,
  },
});

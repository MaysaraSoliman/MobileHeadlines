import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getTaskStatusColor, TASK_STATUS_OPTIONS } from "../../utils/taskUtils";
import { TaskStatus } from "../../types/types";

interface TaskStatusModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectStatus: (status: TaskStatus) => void;
  currentStatus?: string;
}

export const TaskStatusModal: React.FC<TaskStatusModalProps> = ({
  visible,
  onClose,
  onSelectStatus,
  currentStatus,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.statusModalContainer}>
          <Text style={styles.modalTitle}>Update Task Status</Text>
          {TASK_STATUS_OPTIONS.map((status) => (
            <TouchableOpacity
              key={status}
              style={styles.statusOption}
              onPress={() => onSelectStatus(status as TaskStatus)}
            >
              <Text
                style={[
                  styles.statusOptionText,
                  { color: getTaskStatusColor(status) },
                  currentStatus === status && styles.selectedStatus,
                ]}
              >
                {status.replace("_", " ")}
              </Text>
              {currentStatus === status && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={getTaskStatusColor(status)}
                />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusModalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  statusOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectedStatus: {
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { AppointmentStatus } from "../../types/types";
import { getStatusColor } from "../../utils/appointmentUtils";

dayjs.extend(utc);

interface AppointmentItemProps {
  item: any; // Using any for now to avoid strict type issues with differing GQL responses, but ideally should be Appointment type
  onPress: () => void;
  onPressStatus: (status: AppointmentStatus) => void;
}

export const AppointmentItem: React.FC<AppointmentItemProps> = ({
  item,
  onPress,
  onPressStatus,
}) => {
  // Handle different time formats
  let startTimeDisplay = item.startTime;
  let endTimeDisplay = item.endTime;

  if (dayjs(item.startTime).isValid() && item.startTime.includes("T")) {
    startTimeDisplay = dayjs(item.startTime).format("HH:mm");
  }
  if (dayjs(item.endTime).isValid() && item.endTime.includes("T")) {
    endTimeDisplay = dayjs(item.endTime).format("HH:mm");
  }

  startTimeDisplay = startTimeDisplay || "--:--";
  endTimeDisplay = endTimeDisplay || "--:--";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.doctorName}>
          {item.company?.name || "No Company"}
        </Text>
        <TouchableOpacity
          style={styles.statusButton}
          onPress={() => onPressStatus(item.status as AppointmentStatus)}
        >
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status} <Ionicons name="chevron-down" size={12} />
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.specialty}>
        {item.person?.firstName} {item.person?.lastName}
      </Text>
      <Text style={styles.subText}>{item.user?.name}</Text>
      <Text style={styles.time}>
        {dayjs.utc(item.date).format("ddd MMM DD YYYY")} at {startTimeDisplay} -{" "}
        {endTimeDisplay}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  doctorName: { fontSize: 18, fontWeight: "bold" },
  statusButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
  },
  status: { fontSize: 14, fontWeight: "bold" },
  specialty: { fontSize: 14, color: "#666", marginBottom: 5 },
  subText: { fontSize: 14, color: "#666", marginBottom: 5 },
  time: { fontSize: 12, color: "#888" },
});

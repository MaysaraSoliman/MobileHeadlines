import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useQuery } from "@apollo/client";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { GET_APPOINTMENT } from "../../src/graphql/queries/queries";

import ScreenNames from "../../src/navigation/ScreenNames";

export default function AppointmentDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { appointmentId } = route.params;

  const { data, loading, error } = useQuery(GET_APPOINTMENT, {
    variables: { id: appointmentId },
  });

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (error)
    return <Text style={styles.error}>Error loading appointment details</Text>;
  if (!data?.appointment)
    return <Text style={styles.error}>Appointment not found</Text>;

  const { appointment } = data;
  const date = new Date(appointment.date).toDateString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "green";
      case "CANCELED":
        return "red";
      case "COMPLETED":
        return "blue";
      default:
        return "orange";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(appointment.status) },
            ]}
          >
            {appointment.status}
          </Text>
        </View>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.time}>
          {appointment.startTime} - {appointment.endTime}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Doctor Information</Text>
        <View style={styles.infoRow}>
          <Ionicons
            name="medkit-outline"
            size={24}
            color="#666"
            style={styles.icon}
          />
          <View>
            <Text style={styles.label}>Doctor</Text>
            <Text style={styles.value}>Dr. {appointment.doctor.name}</Text>
            <Text style={styles.subValue}>{appointment.doctor.specialty}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name="call-outline"
            size={20}
            color="#666"
            style={styles.icon}
          />
          <View>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{appointment.doctor.phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <View style={styles.infoRow}>
          <Ionicons
            name="person-outline"
            size={24}
            color="#666"
            style={styles.icon}
          />
          <View>
            <Text style={styles.label}>Patient</Text>
            <Text style={styles.value}>
              {appointment.patient.firstName} {appointment.patient.lastName}
            </Text>
            <Text style={styles.subValue}>{appointment.patient.phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate(ScreenNames.EditAppointment, { appointmentId })
          }
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Edit Appointment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  header: {
    backgroundColor: "#fff",
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  date: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  time: {
    fontSize: 18,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  icon: {
    marginRight: 15,
    marginTop: 2,
    width: 25,
  },
  label: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  subValue: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 10,
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

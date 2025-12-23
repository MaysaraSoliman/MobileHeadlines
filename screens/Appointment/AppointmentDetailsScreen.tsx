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
import { useQuery, useMutation } from "@apollo/client";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  GET_APPOINTMENT,
  GET_APPOINTMENTS,
} from "../../src/graphql/queries/queries";
import { DELETE_APPOINTMENT } from "../../src/graphql/mutations/mutations";
import ScreenNames from "../../src/navigation/ScreenNames";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default function AppointmentDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { appointmentId } = route.params;

  const [deleteAppointment, { loading: deleting }] = useMutation(
    DELETE_APPOINTMENT,
    {
      refetchQueries: [{ query: GET_APPOINTMENTS }],
      onCompleted: () => {
        Alert.alert("Success", "Appointment deleted successfully");
        navigation.goBack();
      },
      onError: (err) => {
        Alert.alert("Error", err.message);
      },
    }
  );

  const { data, loading, error } = useQuery(GET_APPOINTMENT, {
    variables: { id: appointmentId },
  });

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error loading appointment details</Text>
        <Text style={styles.error}>{error.message}</Text>
      </View>
    );
  if (!data?.appointment)
    return <Text style={styles.error}>Appointment not found</Text>;

  const { appointment } = data;
  const date = dayjs.utc(appointment.date).format("ddd MMM DD YYYY");

  const handleDelete = () => {
    Alert.alert(
      "Delete Appointment",
      "Are you sure you want to delete this appointment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteAppointment({ variables: { id: appointmentId } });
          },
        },
      ]
    );
  };

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
        <Text style={styles.sectionTitle}>Company Information</Text>
        <View style={styles.infoRow}>
          <Ionicons
            name="business-outline"
            size={24}
            color="#666"
            style={styles.icon}
          />
          <View>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>
              {appointment.company?.name || "No Company"}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name="person-outline"
            size={24}
            color="#666"
            style={styles.icon}
          />
          <View>
            <Text style={styles.label}>Person</Text>
            <Text style={styles.value}>
              {appointment.person?.firstName} {appointment.person?.lastName}
            </Text>
            <Text style={styles.subValue}>{appointment.person?.phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Information</Text>
        <View style={styles.infoRow}>
          <Ionicons
            name="person-circle-outline"
            size={24}
            color="#666"
            style={styles.icon}
          />
          <View>
            <Text style={styles.label}>User</Text>
            <Text style={styles.value}>
              {appointment.user?.name || "Unknown User"}
            </Text>
            <Text style={styles.subValue}>{appointment.user?.role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate(ScreenNames.EditAppointment, {
              appointmentId: appointment.id,
            })
          }
        >
          <Text style={styles.editButtonText}>Edit Appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete Appointment</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", textAlign: "center", marginTop: 20 },
  header: {
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statusBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: { fontWeight: "bold", fontSize: 16 },
  date: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  time: { fontSize: 18, color: "#666" },
  section: {
    backgroundColor: "white",
    marginTop: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: { marginRight: 15 },
  label: { fontSize: 12, color: "#999", marginBottom: 2 },
  value: { fontSize: 16, color: "#333", fontWeight: "500" },
  subValue: { fontSize: 14, color: "#666", marginTop: 2 },
  actionContainer: {
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  editButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  editButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

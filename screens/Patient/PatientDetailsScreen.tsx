import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { useQuery } from "@apollo/client";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { GET_PATIENT } from "../../src/graphql/queries/queries";

import ScreenNames from "../../src/navigation/ScreenNames";

export default function PatientDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { patientId } = route.params;

  const { data, loading, error } = useQuery(GET_PATIENT, {
    variables: { id: patientId },
  });

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (error)
    return <Text style={styles.error}>Error loading patient details</Text>;

  const { patient } = data;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {patient.firstName[0]}
            {patient.lastName[0]}
          </Text>
        </View>
        <Text style={styles.name}>
          {patient.firstName} {patient.lastName}
        </Text>
        <Text style={styles.subtitle}>Patient ID: {patient.id.slice(-6)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            if (patient.phone) {
              Linking.openURL(`tel:${patient.phone}`);
            }
          }}
        >
          <Ionicons
            name="call-outline"
            size={20}
            color="#666"
            style={styles.icon}
          />
          <View>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{patient.phone}</Text>
          </View>
        </TouchableOpacity>

        {patient.email && (
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => {
              if (patient.email) {
                Linking.openURL(`mailto:${patient.email}`);
              }
            }}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <View>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{patient.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate(ScreenNames.EditPatient, { patientId })
          }
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.actionText}>Edit Patient Details</Text>
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
    alignItems: "center",
    padding: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e1f0ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    color: "#007AFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 20,
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
  icon: {
    marginRight: 15,
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

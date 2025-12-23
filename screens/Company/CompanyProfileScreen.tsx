import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useQuery } from "@apollo/client";
import { GET_COMPANY } from "../../src/graphql/queries/queries";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../src/navigation/NavigationTypes";
import ScreenNames from "../../src/navigation/ScreenNames";
import { Ionicons } from "@expo/vector-icons";

type CompanyProfileScreenRouteProp = RouteProp<
  RootStackParamList,
  ScreenNames.CompanyProfileScreen
>;

type CompanyProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  ScreenNames.CompanyProfileScreen
>;

export default function CompanyProfileScreen() {
  const route = useRoute<CompanyProfileScreenRouteProp>();
  const navigation = useNavigation<CompanyProfileScreenNavigationProp>();
  const { companyId } = route.params;

  const { data, loading, error } = useQuery(GET_COMPANY, {
    variables: { id: companyId },
  });

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error.message}</Text>;

  const { company } = data;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {company.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{company.name}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate(ScreenNames.EditCompanyScreen, { companyId })
          }
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <Text style={styles.rowText}>{company.email || "No email"}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <Text style={styles.rowText}>{company.phone || "No phone"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{company.persons?.length || 0}</Text>
            <Text style={styles.statLabel}>Persons</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{company.deals?.length || 0}</Text>
            <Text style={styles.statLabel}>Deals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {company.appointments?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Appointments</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 32, color: "white", fontWeight: "bold" },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  editButton: { flexDirection: "row", alignItems: "center" },
  editText: { color: "#007AFF", marginLeft: 5, fontSize: 16 },
  section: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rowText: { marginLeft: 10, fontSize: 16, color: "#333" },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#007AFF" },
  statLabel: { color: "#666", marginTop: 5 },
});

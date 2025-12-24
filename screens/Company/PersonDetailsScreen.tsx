import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@apollo/client";
import { GET_PERSONS_BY_COMPANY } from "../../src/graphql/queries/queries";
import { RootStackParamList } from "../../src/navigation/NavigationTypes";
import ScreenNames from "../../src/navigation/ScreenNames";
import { Person } from "../../src/types/types";

type PersonDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  ScreenNames.PersonDetailsScreen
>;

type PersonDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  ScreenNames.PersonDetailsScreen
>;

export default function PersonDetailsScreen() {
  const navigation = useNavigation<PersonDetailsScreenNavigationProp>();
  const route = useRoute<PersonDetailsScreenRouteProp>();
  const { personId, personName, companyId, companyName } = route.params;

  const { data, loading, error } = useQuery<{ personsByCompany: Person[] }>(
    GET_PERSONS_BY_COMPANY,
    {
      variables: { companyId },
    }
  );

  const person = data?.personsByCompany.find((p) => p.id === personId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: personName,
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => {
            if (person) {
              navigation.navigate(ScreenNames.EditPersonScreen, {
                person,
                companyId,
              });
            }
          }}
        >
          <Text style={{ color: "#007AFF", fontSize: 16 }}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, personName, person, companyId]);

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error.message}</Text>;
  if (!person) return <Text style={styles.center}>Person not found</Text>;

  const handleCall = () => {
    if (person.phone) {
      Linking.openURL(`tel:${person.phone}`);
    } else {
      Alert.alert("Error", "No phone number available");
    }
  };

  const handleWhatsApp = () => {
    if (person.phone) {
      let cleanPhone = person.phone.replaceAll(/\D/g, "");

      // Handle local numbers starting with 0 by adding country code (Defaulting to Egypt +20)
      if (cleanPhone.startsWith("0")) {
        cleanPhone = "2" + cleanPhone;
      }

      const whatsappUrl = `whatsapp://send?phone=${cleanPhone}`;

      Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            return Linking.openURL(`https://wa.me/${cleanPhone}`);
          }
        })
        .catch((err) => Alert.alert("Error", "Could not open WhatsApp"));
    } else {
      Alert.alert("Error", "No phone number available");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {person.firstName[0]}
            {person.lastName[0]}
          </Text>
        </View>
        <Text style={styles.name}>
          {person.firstName} {person.lastName}
        </Text>
        <Text style={styles.company}>{companyName}</Text>
        {person.role && <Text style={styles.role}>{person.role}</Text>}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <View style={[styles.actionIcon, { backgroundColor: "#e3f2fd" }]}>
            <Ionicons name="call-outline" size={24} color="#1976d2" />
          </View>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
          <View style={[styles.actionIcon, { backgroundColor: "#e0f2f1" }]}>
            <Ionicons name="logo-whatsapp" size={24} color="#00695c" />
          </View>
          <Text style={styles.actionText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.detailItem}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <Text style={styles.detailText}>
            {person.email || "No email provided"}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <Text style={styles.detailText}>
            {person.phone || "No phone provided"}
          </Text>
        </View>
        {person.notes && (
          <View style={styles.detailItem}>
            <Ionicons name="document-text-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{person.notes}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() =>
          navigation.navigate(ScreenNames.BookAppointmentScreen, {
            companyId,
            personId,
          })
        }
      >
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
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
  headerSection: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  company: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  role: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
    marginTop: 10,
    elevation: 1,
  },
  actionButton: {
    alignItems: "center",
    marginHorizontal: 30,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    color: "#555",
  },
  detailsSection: {
    marginTop: 10,
    backgroundColor: "white",
    padding: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  bookButton: {
    margin: 20,
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

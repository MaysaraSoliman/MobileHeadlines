import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PERSONS_BY_COMPANY } from "../../src/graphql/queries/queries";
import { UPDATE_PERSON } from "../../src/graphql/mutations/mutations";
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

  // Since we don't have a GET_PERSON query, we rely on GET_PERSONS_BY_COMPANY
  // or pass the full person object. But passing full object is risky if it updates.
  // For now, let's fetch persons by company and find this person.
  // Ideally we should implement GET_PERSON query.
  // Or we can rely on route params if we are sure they are up to date.
  // Let's implement client-side filtering from GET_PERSONS_BY_COMPANY cache or fetch.

  const { data, loading, error } = useQuery<{ personsByCompany: Person[] }>(
    GET_PERSONS_BY_COMPANY,
    {
      variables: { companyId },
    }
  );

  const person = data?.personsByCompany.find((p) => p.id === personId);

  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [updatePerson, { loading: updating }] = useMutation(UPDATE_PERSON, {
    refetchQueries: [
      {
        query: GET_PERSONS_BY_COMPANY,
        variables: { companyId },
      },
    ],
    onCompleted: () => {
      setIsEditing(false);
      Alert.alert("Success", "Person updated successfully");
    },
    onError: (err) => {
      Alert.alert("Error", err.message);
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Edit Person" : personName,
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => {
            if (isEditing) {
              setIsEditing(false);
            } else if (person) {
              setEditFirstName(person.firstName);
              setEditLastName(person.lastName);
              setEditEmail(person.email || "");
              setEditPhone(person.phone || "");
              setIsEditing(true);
            }
          }}
        >
          <Text style={{ color: "#007AFF", fontSize: 16 }}>
            {isEditing ? "Cancel" : "Edit"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, personName, isEditing, person]);

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

  const handleSave = () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      Alert.alert("Error", "First and Last names are required");
      return;
    }

    updatePerson({
      variables: {
        input: {
          id: personId,
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          phone: editPhone,
        },
      },
    });
  };

  if (isEditing) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.formSection}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={editFirstName}
            onChangeText={setEditFirstName}
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={editLastName}
            onChangeText={setEditLastName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={editEmail}
            onChangeText={setEditEmail}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={editPhone}
            onChangeText={setEditPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

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
  formSection: {
    padding: 20,
    backgroundColor: "white",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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

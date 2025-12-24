import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useMutation } from "@apollo/client";
import { UPDATE_PERSON } from "../../src/graphql/mutations/mutations";
import {
  GET_PERSONS_BY_COMPANY,
  GET_COMPANY,
} from "../../src/graphql/queries/queries";
import { RootStackParamList } from "../../src/navigation/NavigationTypes";
import ScreenNames from "../../src/navigation/ScreenNames";

type EditPersonScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  ScreenNames.EditPersonScreen
>;

type EditPersonScreenRouteProp = RouteProp<
  RootStackParamList,
  ScreenNames.EditPersonScreen
>;

export default function EditPersonScreen() {
  const navigation = useNavigation<EditPersonScreenNavigationProp>();
  const route = useRoute<EditPersonScreenRouteProp>();
  const { person, companyId } = route.params;

  const [firstName, setFirstName] = useState(person.firstName);
  const [lastName, setLastName] = useState(person.lastName);
  const [email, setEmail] = useState(person.email || "");
  const [phone, setPhone] = useState(person.phone || "");
  const [role, setRole] = useState(person.role || "");
  const [notes, setNotes] = useState(person.notes || "");

  const [updatePerson, { loading }] = useMutation(UPDATE_PERSON, {
    refetchQueries: [
      {
        query: GET_PERSONS_BY_COMPANY,
        variables: { companyId, search: "" },
      },
      {
        query: GET_COMPANY,
        variables: { id: companyId },
      },
    ],
    onCompleted: () => {
      Alert.alert("Success", "Person updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err) => {
      Alert.alert("Error", err.message);
    },
  });

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "First and Last names are required");
      return;
    }

    updatePerson({
      variables: {
        input: {
          id: person.id,
          firstName,
          lastName,
          email,
          phone,
          role,
          notes,
        },
      },
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text
              style={{ color: "#007AFF", fontSize: 16, fontWeight: "bold" }}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, firstName, lastName, email, phone, role, notes, loading]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formSection}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="Enter email"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
        />

        <Text style={styles.label}>Role</Text>
        <TextInput
          style={styles.input}
          value={role}
          onChangeText={setRole}
          placeholder="e.g. Manager, Developer"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="Enter notes about this person..."
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  formSection: {
    padding: 20,
    backgroundColor: "white",
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
  },
});

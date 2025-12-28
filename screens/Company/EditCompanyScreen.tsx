import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useMutation, useQuery } from "@apollo/client/react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { UPDATE_COMPANY } from "../../src/graphql/mutations/mutations";
import { GET_COMPANY } from "../../src/graphql/queries/queries";
import { RootStackParamList } from "../../src/navigation/NavigationTypes";
import ScreenNames from "../../src/navigation/ScreenNames";

type EditCompanyScreenRouteProp = RouteProp<
  RootStackParamList,
  ScreenNames.EditCompanyScreen
>;

export default function EditCompanyScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditCompanyScreenRouteProp>();
  const { companyId } = route.params;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const { data, loading: queryLoading } = useQuery<any>(GET_COMPANY, {
    variables: { id: companyId },
  });

  useEffect(() => {
    if (data?.company) {
      setName(data.company.name || "");
      setEmail(data.company.email || "");
      setPhone(data.company.phone || "");
    }
  }, [data]);

  const [updateCompany, { loading: mutationLoading }] = useMutation<any>(
    UPDATE_COMPANY,
    {
      refetchQueries: [{ query: GET_COMPANY, variables: { id: companyId } }],
      onCompleted: () => {
        Alert.alert("Success", "Company updated successfully");
        navigation.goBack();
      },
      onError: (error) => {
        Alert.alert("Error", error.message || "Failed to update company");
      },
    }
  );

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Company name is required");
      return;
    }

    updateCompany({
      variables: {
        input: {
          id: companyId,
          name,
          email,
          phone,
        },
      },
    });
  };

  if (queryLoading) return <ActivityIndicator style={styles.center} />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Company Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter company name"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={mutationLoading}
        >
          {mutationLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

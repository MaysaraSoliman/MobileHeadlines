import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useMutation } from "@apollo/client/react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { CREATE_DEAL } from "../../src/graphql/mutations/mutations";
import { GET_COMPANY } from "../../src/graphql/queries/queries";
import { RootStackParamList } from "../../src/navigation/NavigationTypes";
import ScreenNames from "../../src/navigation/ScreenNames";

type CreateDealScreenRouteProp = RouteProp<
  RootStackParamList,
  ScreenNames.CreateDealScreen
>;

export default function CreateDealScreen() {
  const navigation = useNavigation();
  const route = useRoute<CreateDealScreenRouteProp>();
  const { companyId } = route.params;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("OPEN");

  const [createDeal, { loading }] = useMutation(CREATE_DEAL, {
    refetchQueries: [{ query: GET_COMPANY, variables: { id: companyId } }],
    onCompleted: () => {
      Alert.alert("Success", "Deal created successfully");
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create deal");
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Deal title is required");
      return;
    }
    if (!amount.trim() || Number.isNaN(Number(amount))) {
      Alert.alert("Error", "Valid amount is required");
      return;
    }

    createDeal({
      variables: {
        input: {
          companyId,
          title,
          amount: Number.parseFloat(amount),
          status,
        },
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Deal Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter deal title"
        />

        <Text style={styles.label}>Amount *</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusContainer}>
          {["OPEN", "WON", "LOST"].map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusButton,
                status === s && styles.statusButtonActive,
              ]}
              onPress={() => setStatus(s)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === s && styles.statusButtonTextActive,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Deal</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 20 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: "600", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  statusContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  statusButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  statusButtonText: { color: "#666" },
  statusButtonTextActive: { color: "#fff" },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

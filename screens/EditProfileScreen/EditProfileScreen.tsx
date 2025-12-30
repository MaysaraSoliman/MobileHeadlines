import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../src/context/AuthContext";
import { updateUserMutation } from "../../src/graphql/mutations/mutations";
import { useMutation } from "@apollo/client/react";

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuth();
  const navigation = useNavigation();
  const [name, setName] = useState(user?.name || "");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  }, [refreshUser]);

  const [updateProfile, { loading }] = useMutation<any>(updateUserMutation, {
    onCompleted: () => {
      (async () => {
        await refreshUser();
        Alert.alert("Success", "Profile updated successfully");
        navigation.goBack();
      })();
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update profile");
    },
  });

  const handleSave = () => {
    updateProfile({
      variables: {
        input: {
          name,
        },
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={user?.email}
          editable={false}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  form: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

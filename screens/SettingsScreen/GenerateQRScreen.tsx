import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { gql, useMutation } from "@apollo/client";
import { useAuth } from "../../src/context/AuthContext";

const GENERATE_LOGIN_TOKEN = gql`
  mutation GenerateLoginToken($userId: ID!) {
    generateLoginToken(userId: $userId)
  }
`;

export default function GenerateQRScreen() {
  const { user } = useAuth();
  const route = useRoute<any>();
  const targetUserId = route.params?.userId || user?.id;
  const targetUserName = route.params?.userName || "yourself";

  const [token, setToken] = useState<string | null>(null);

  const [generateToken, { loading }] = useMutation(GENERATE_LOGIN_TOKEN, {
    onCompleted: (data) => {
      setToken(data.generateLoginToken);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleGenerate = () => {
    if (targetUserId) {
      generateToken({ variables: { userId: targetUserId } });
    } else {
      Alert.alert("Error", "User ID not found");
    }
  };

  const copyToClipboard = async () => {
    if (token) {
      await Clipboard.setStringAsync(token);
      Alert.alert("Copied", "Token copied to clipboard");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login Code Generator</Text>
      <Text style={styles.description}>
        Generate a QR code or token to log in as {targetUserName} on another
        device securely. This token is valid for 10 minutes and can only be used
        once.
      </Text>

      {token ? (
        <View style={styles.resultContainer}>
          <View style={styles.qrContainer}>
            <QRCode value={token} size={200} />
          </View>

          <Text style={styles.tokenLabel}>Manual Entry Token:</Text>
          <TouchableOpacity onPress={copyToClipboard} style={styles.tokenBox}>
            <Text style={styles.tokenText}>{token}</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Tap token to copy</Text>

          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Generate New Code</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Generate Code</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 20,
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  resultContainer: {
    width: "100%",
    alignItems: "center",
  },
  qrContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30,
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  tokenBox: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tokenText: {
    fontFamily: "monospace",
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginBottom: 30,
    alignSelf: "flex-end",
    marginRight: 10,
  },
  generateButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  regenerateButton: {
    backgroundColor: "#5856D6",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

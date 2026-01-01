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
  Button,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { gql, useMutation } from "@apollo/client";
import { useAuth } from "../../src/context/AuthContext";
import ScreenStacks from "../../src/navigation/ScreenStacks";

const LOGIN_WITH_TOKEN = gql`
  mutation LoginWithToken($token: String!) {
    loginWithToken(token: $token) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export default function LoginWithQRScreen() {
  const navigation = useNavigation<any>();
  const { signIn } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const [loginWithToken, { loading }] = useMutation(LOGIN_WITH_TOKEN, {
    onCompleted: (data) => {
      const completeLogin = async () => {
        try {
          await signIn(data.loginWithToken.token);
          navigation.reset({
            index: 0,
            routes: [{ name: ScreenStacks.MainTabs }],
          });
        } catch (error) {
          console.error("Error signing in:", error);
          Alert.alert("Error", "Failed to save login session.");
        }
      };
      completeLogin();
    },
    onError: (error) => {
      Alert.alert("Login Failed", error.message);
      setScanned(false); // Allow rescanning
    },
  });

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setShowScanner(false); // Close scanner UI
    // Assuming the QR code contains just the token string
    loginWithToken({ variables: { token: data } });
  };

  const handleManualLogin = () => {
    if (!tokenInput.trim()) {
      Alert.alert("Error", "Please enter a token");
      return;
    }
    loginWithToken({ variables: { token: tokenInput.trim() } });
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Camera Access Needed</Text>
          <Text style={{ textAlign: "center", marginBottom: 20 }}>
            We need your permission to show the camera
          </Text>
          <Button onPress={requestPermission} title="Grant Permission" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Login with Token</Text>

        {showScanner ? (
          <View style={styles.scannerContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowScanner(false)}
            >
              <Text style={styles.buttonText}>Cancel Scan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                setScanned(false);
                setShowScanner(true);
              }}
            >
              <Text style={styles.buttonText}>Scan QR Code</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Paste Login Token"
              value={tokenInput}
              onChangeText={setTokenInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleManualLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.linkText}>Back to Email Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  scannerContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  scanButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#34C759",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  backButton: {
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 10,
    color: "#666",
    fontWeight: "bold",
  },
});

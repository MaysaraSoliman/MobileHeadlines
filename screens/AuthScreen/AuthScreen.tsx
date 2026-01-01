import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import ScreenStacks from "../../src/navigation/ScreenStacks";
import ScreenNames from "../../src/navigation/ScreenNames";
import { useAuth } from "../../src/context/AuthContext";

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        createdAt
        updatedAt
      }
    }
  }
`;

type RootStackParamList = {
  [ScreenStacks.MainTabs]: undefined;
  [ScreenNames.RegisterScreen]: undefined;
  [ScreenNames.LoginWithQRScreen]: undefined;
};

type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get("window");

export default function AuthScreen() {
  const { reset, navigate } = useNavigation<AuthNavigationProp>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data: any) => {
      (async () => {
        try {
          await signIn(data.login.token);
          reset({
            index: 0,
            routes: [{ name: ScreenStacks.MainTabs }],
          });
        } catch (error) {
          console.error("Error signing in:", error);
        }
      })();
    },
    onError: (error: any) => {
      Alert.alert("Login Failed", error.message);
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    login({ variables: { input: { email, password } } });
  };

  return (
    <ImageBackground
      source={require("../../assets/login-background.jpeg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: "#5856D6", marginTop: 15 },
            ]}
            onPress={() => navigate(ScreenNames.LoginWithQRScreen)}
          >
            <Text style={styles.loginButtonText}>Login with QR / Token</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigate(ScreenNames.RegisterScreen)}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  formContainer: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#666",
    fontSize: 14,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerLink: {
    marginTop: 20,
  },
  registerLinkText: {
    color: "#007AFF",
    fontSize: 14,
  },
});

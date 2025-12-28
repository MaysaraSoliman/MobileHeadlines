import React from "react";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from "@apollo/client/link/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainStack from "./src/navigation/MainStack";
import { AuthProvider } from "./src/context/AuthContext";
import { NotificationHandler } from "./src/components/NotificationHandler";
import registerNNPushToken from "native-notify";

const httpLink = new HttpLink({
  // Use "http://10.0.2.2:4000/graphql" for Android Emulator
  // Use "http://192.168.1.11:4000/graphql" for Physical Device (your current Wi-Fi IP)
  // Use "http://localhost:4000/graphql" for iOS Simulator
  // uri: "http://172.20.10.2:4000/graphql", // for Expo Go on Hotspot
  // uri: "http://192.168.1.11:4000/graphql",
  // uri: "http://192.168.1.1:4000/graphql",
  uri: "https://janae-bladdery-unallayably.ngrok-free.dev/graphql",
  // uri: "http://172.20.10.2:4000/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem("token");
  console.log("token", token);

  // Debug log to verify token is being passed
  // console.log("🔑 Auth Token:", token ? "Present" : "Missing");

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Initialize Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export const navigationRef = createNavigationContainerRef();

export default function App() {
  registerNNPushToken(33053, "oZEpcHrXyM0mYxTDD0iRFL");
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <SafeAreaProvider>
          <SafeAreaView
            style={styles.container}
            edges={["top", "bottom", "left", "right"]}
          >
            <NavigationContainer ref={navigationRef}>
              <NotificationHandler navigationRef={navigationRef} />
              <MainStack />
            </NavigationContainer>
          </SafeAreaView>
        </SafeAreaProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

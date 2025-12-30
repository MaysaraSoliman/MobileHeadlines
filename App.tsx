import React, { useEffect } from "react";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet, LogBox } from "react-native";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import ScreenStacks from "./src/navigation/ScreenStacks";
import ScreenNames from "./src/navigation/ScreenNames";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  split,
} from "@apollo/client";

// Ignore specific warnings
LogBox.ignoreLogs([
  "cache.diff", // Ignore Apollo Client deprecation warning for canonizeResults
  "canonizeResults", // Ignore related warning
  "An error occurred! For more details, see the full error text at https://go.apollo.dev/c/err", // Ignore Apollo Client hidden warnings
  "expo-notifications", // Ignore Expo Go notification warnings
]);

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { setContext } from "@apollo/client/link/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainStack from "./src/navigation/MainStack";
import { AuthProvider } from "./src/context/AuthContext";
import { ChatProvider } from "./src/context/ChatContext";
import { NotificationController } from "./src/components/NotificationController";
import * as Notifications from "expo-notifications";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const httpLink = new HttpLink({
  // Use "http://10.0.2.2:4000/graphql" for Android Emulator
  // Use "http://192.168.1.11:4000/graphql" for Physical Device (your current Wi-Fi IP)
  // Use "http://localhost:4000/graphql" for iOS Simulator
  // uri: "http://172.20.10.2:4000/graphql", // for Expo Go on Hotspot
  uri: "http://192.168.1.5:4000/graphql",
  // uri: "http://172.20.10.2:4000/graphql",
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://192.168.1.5:4000/graphql",
    connectionParams: async () => {
      const token = await AsyncStorage.getItem("token");
      return {
        Authorization: token ? `Bearer ${token}` : "",
      };
    },
  })
);

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem("token");

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

const splitLink = split(
  ({ query }: { query: any }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Initialize Apollo Client
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    // Listener for when a user taps on a notification while the app is running (foreground or background)
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          chatId?: string;
          taskId?: string;
        };
        if (data?.chatId) {
          navigateToChat(data.chatId);
        } else if (data?.taskId) {
          navigateToTask(data.taskId);
        }
      }
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      const data = lastNotificationResponse.notification.request.content
        .data as {
        chatId?: string;
        taskId?: string;
      };
      if (navigationRef.isReady()) {
        if (data?.chatId) {
          navigateToChat(data.chatId);
        } else if (data?.taskId) {
          navigateToTask(data.taskId);
        }
      }
    }
  }, [lastNotificationResponse]);

  const navigateToChat = (chatId: string) => {
    if (navigationRef.isReady()) {
      // @ts-ignore - Ignoring type check for complex nested navigation
      navigationRef.navigate(ScreenStacks.MainTabs, {
        screen: ScreenStacks.ChatStack,
        params: {
          screen: "ChatRoom",
          params: { chatId },
        },
      });
    }
  };

  const navigateToTask = (taskId: string) => {
    if (navigationRef.isReady()) {
      // @ts-ignore - Ignoring type check for complex nested navigation
      navigationRef.navigate(ScreenStacks.MainTabs, {
        screen: ScreenStacks.TasksStack,
        params: {
          screen: ScreenNames.TaskDetailsScreen,
          params: { taskId },
        },
      });
    }
  };

  const onNavigationReady = () => {
    // Check if app was opened by a notification (cold start)
    if (
      lastNotificationResponse &&
      lastNotificationResponse.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      const data = lastNotificationResponse.notification.request.content
        .data as {
        chatId?: string;
        taskId?: string;
      };
      if (data?.chatId) {
        navigateToChat(data.chatId);
      } else if (data?.taskId) {
        navigateToTask(data.taskId);
      }
    }
  };

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <ChatProvider>
          <NotificationController />
          <SafeAreaProvider>
            <SafeAreaView
              style={styles.container}
              edges={["top", "bottom", "left", "right"]}
            >
              <NavigationContainer
                ref={navigationRef}
                onReady={onNavigationReady}
              >
                <MainStack />
              </NavigationContainer>
            </SafeAreaView>
          </SafeAreaProvider>
        </ChatProvider>
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

import { StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Notifications from "expo-notifications";
import { useSubscription } from "@apollo/client";
import ScreenStacks from "../ScreenStacks";
import HomeStack from "../Stacks/HomeStack";
import ChatStack from "../Stacks/ChatStack";
import {
  HomeIcon,
  SettingsIcon,
  AppointmentsIcon,
  CompaniesIcon,
  TasksIcon,
  ChatIcon,
} from "../../Icons/Icons";
import SettingsStack from "../Stacks/SettingsStack";
import AppointmentsStack from "../Stacks/AppointmentsStack";
import CompaniesStack from "../Stacks/CompaniesStack";
import TasksStack from "../Stacks/TasksStack";
import { useAuth } from "../../context/AuthContext";
import { MESSAGE_RECEIVED_SUBSCRIPTION } from "../../graphql/subscriptions/chat.subscriptions";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function MainTabs() {
  const Tab = createBottomTabNavigator();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to new messages for the user
  useSubscription(MESSAGE_RECEIVED_SUBSCRIPTION, {
    variables: { userId: user?.id },
    skip: !user?.id,
    onData: ({ data }) => {
      const message = data.data?.messageReceived;
      if (message) {
        // Increment badge count
        setUnreadCount((prev) => prev + 1);

        // Schedule local notification
        Notifications.scheduleNotificationAsync({
          content: {
            title: message.sender.name,
            body: message.content,
            data: { chatId: message.chat.id },
          },
          trigger: null, // Show immediately
        });
      }
    },
  });

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
    })();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 55,
          paddingBottom: 5,
          paddingTop: 5,
        },
        animation: "fade",
      }}
    >
      <Tab.Screen
        name={ScreenStacks.HomeStack}
        component={HomeStack}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name={ScreenStacks.TasksStack}
        component={TasksStack}
        options={{
          tabBarLabel: "Tasks",
          tabBarIcon: TasksIcon,
        }}
      />
      <Tab.Screen
        name={ScreenStacks.AppointmentsStack}
        component={AppointmentsStack}
        options={{
          tabBarLabel: "Appointments",
          tabBarIcon: AppointmentsIcon,
        }}
      />
      <Tab.Screen
        name={ScreenStacks.CompaniesStack}
        component={CompaniesStack}
        options={{
          tabBarLabel: "Companies",
          tabBarIcon: CompaniesIcon,
        }}
      />
      <Tab.Screen
        name={ScreenStacks.ChatStack}
        component={ChatStack}
        listeners={{
          tabPress: () => {
            // Reset badge count when opening Chat tab
            setUnreadCount(0);
          },
        }}
        options={{
          tabBarLabel: "Chat",
          tabBarIcon: ChatIcon,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name={ScreenStacks.SettingsStack}
        component={SettingsStack}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({});

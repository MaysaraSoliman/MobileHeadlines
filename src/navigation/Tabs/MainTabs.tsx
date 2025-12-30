import { StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Notifications from "expo-notifications";
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
import { useChat } from "../../context/ChatContext";

export default function MainTabs() {
  const Tab = createBottomTabNavigator();
  const { user } = useAuth();
  const { unreadCount } = useChat();

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
        options={{
          tabBarLabel: "Chats",
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

import { StyleSheet } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ScreenStacks from "../ScreenStacks";
import HomeStack from "../Stacks/HomeStack";
import {
  HomeIcon,
  SettingsIcon,
  AppointmentsIcon,
  CompaniesIcon,
  TasksIcon,
} from "../../Icons/Icons";
import SettingsStack from "../Stacks/SettingsStack";
import AppointmentsStack from "../Stacks/AppointmentsStack";
import CompaniesStack from "../Stacks/CompaniesStack";
import TasksStack from "../Stacks/TasksStack";

export default function MainTabs() {
  const Tab = createBottomTabNavigator();
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

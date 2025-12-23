import { StyleSheet } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FavoritesScreen from "../../../screens/FavoritesScreen/FavoritesScreen";
import ScreenNames from "../ScreenNames";
import ScreenStacks from "../ScreenStacks";
import HomeStack from "../Stacks/HomeStack";
import {
  FavoritesIcon,
  HomeIcon,
  SettingsIcon,
  AppointmentsIcon,
  CompaniesIcon,
} from "../../Icons/Icons";
import SettingsStack from "../Stacks/SettingsStack";
import AppointmentsStack from "../Stacks/AppointmentsStack";
import CompaniesStack from "../Stacks/CompaniesStack";

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
        name={ScreenNames.FavoritesScreen}
        component={FavoritesScreen}
        options={{
          tabBarLabel: "Favorites",
          tabBarIcon: FavoritesIcon,
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

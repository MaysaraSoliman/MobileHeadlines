import React from "react";
import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import ScreenNames from "../ScreenNames";
import SettingsScreen from "../../../screens/SettingsScreen/SettingsScreen";
import EditProfileScreen from "../../../screens/EditProfileScreen/EditProfileScreen";

import GenerateQRScreen from "../../../screens/SettingsScreen/GenerateQRScreen";
import UsersListScreen from "../../../screens/SettingsScreen/UsersListScreen";

const Stack = createStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name={ScreenNames.SettingsScreen}
        component={SettingsScreen}
      />
      <Stack.Screen
        name={ScreenNames.EditProfileScreen}
        component={EditProfileScreen}
      />
      <Stack.Screen
        name={ScreenNames.GenerateQRScreen}
        component={GenerateQRScreen}
      />
      <Stack.Screen
        name={ScreenNames.UsersListScreen}
        component={UsersListScreen}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});

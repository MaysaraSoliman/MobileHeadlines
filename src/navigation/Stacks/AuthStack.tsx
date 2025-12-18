import React from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "../../../screens/AuthScreen/AuthScreen";
import ScreenNames from "../ScreenNames";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name={ScreenNames.AuthScreen} component={AuthScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});

import React from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "../../../screens/AuthScreen/AuthScreen";
import RegisterScreen from "../../../screens/AuthScreen/RegisterScreen";
import LoginWithQRScreen from "../../../screens/AuthScreen/LoginWithQRScreen";
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
      <Stack.Screen name={ScreenNames.RegisterScreen} component={RegisterScreen} />
      <Stack.Screen name={ScreenNames.LoginWithQRScreen} component={LoginWithQRScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});

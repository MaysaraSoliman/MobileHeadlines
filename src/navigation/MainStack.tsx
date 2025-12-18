import React from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthStack from "./Stacks/AuthStack";
import ScreenStacks from "./ScreenStacks";
import MainTabs from "./Tabs/MainTabs";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={ScreenStacks.AuthStack} component={AuthStack} />
      <Stack.Screen name={ScreenStacks.MainTabs} component={MainTabs} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});

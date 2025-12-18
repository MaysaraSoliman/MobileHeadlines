import React from "react";
import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import ScreenNames from "../ScreenNames";
import HomeScreen from "../../../screens/HomeScreen/HomeScreen";
import ArticleDetails from "../../../screens/ArticleDetails/ArticleDetails";

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name={ScreenNames.HomeScreen} component={HomeScreen} />
      <Stack.Screen
        name={ScreenNames.ArticleDetails}
        component={ArticleDetails}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});

import React from "react";
import { Platform, StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import ScreenNames from "../ScreenNames";
import HomeScreen from "../../../screens/HomeScreen/HomeScreen";
import ArticleDetails from "../../../screens/ArticleDetails/ArticleDetails";
import AddPatientScreen from "../../../screens/Patient/AddPatientScreen";

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
        options={{
          headerShown: true,
          title: "Article Details",
          headerBackTitle: "Back",
          headerStyle: {
            height: Platform.OS === "android" ? 50 : 80,
          },
          headerTitleStyle: {
            fontSize: 17,
          },
          headerTitleContainerStyle: {
            paddingBottom: Platform.OS === "android" ? 0 : 5,
          },
        }}
      />
      <Stack.Screen
        name={ScreenNames.AddPatientScreen}
        component={AddPatientScreen}
        options={{
          headerShown: true,
          title: "Add New Patient",
          headerBackTitle: "Back",
          headerStyle: {
            height: Platform.OS === "android" ? 50 : 80,
          },
          headerTitleStyle: {
            fontSize: 17,
          },
          headerTitleContainerStyle: {
            paddingBottom: Platform.OS === "android" ? 0 : 5,
          },
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});

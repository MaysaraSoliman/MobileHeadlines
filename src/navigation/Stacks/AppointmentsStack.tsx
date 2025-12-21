import React from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenNames from "../ScreenNames";
import AppointmentsListScreen from "../../../screens/Appointment/AppointmentsListScreen";
import BookAppointmentScreen from "../../../screens/Appointment/BookAppointmentScreen";

const Stack = createNativeStackNavigator();

export default function AppointmentsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name={ScreenNames.AppointmentsList}
        component={AppointmentsListScreen}
      />
      <Stack.Screen
        name={ScreenNames.BookAppointment}
        component={BookAppointmentScreen}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});

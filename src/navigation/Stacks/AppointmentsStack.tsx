import React from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenNames from "../ScreenNames";
import AppointmentsListScreen from "../../../screens/Appointment/AppointmentsListScreen";
import BookAppointmentScreen from "../../../screens/Appointment/BookAppointmentScreen";
import AppointmentDetailsScreen from "../../../screens/Appointment/AppointmentDetailsScreen";
import EditAppointmentScreen from "../../../screens/EditAppointment/EditAppointmentScreen";

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
        name={ScreenNames.BookAppointmentScreen}
        component={BookAppointmentScreen}
        options={{
          headerShown: true,
          title: "Book Appointment",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name={ScreenNames.AppointmentDetails}
        component={AppointmentDetailsScreen}
        options={{ headerShown: true, title: "Appointment Details" }}
      />
      <Stack.Screen
        name={ScreenNames.EditAppointment}
        component={EditAppointmentScreen}
        options={{ headerShown: true, title: "Edit Appointment" }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});

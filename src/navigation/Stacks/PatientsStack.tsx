import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenNames from "../ScreenNames";
import PatientsListScreen from "../../../screens/Patient/PatientsListScreen";
import AddPatientScreen from "../../../screens/Patient/AddPatientScreen";
import PatientDetailsScreen from "../../../screens/Patient/PatientDetailsScreen";
import EditPatientScreen from "../../../screens/EditPatient/EditPatientScreen";

const Stack = createNativeStackNavigator();

export default function PatientsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ScreenNames.PatientsList}
        component={PatientsListScreen}
        options={{ title: "Patients" }}
      />
      <Stack.Screen
        name={ScreenNames.AddPatientScreen}
        component={AddPatientScreen}
        options={{ title: "Add Patient" }}
      />
      <Stack.Screen
        name={ScreenNames.PatientDetails}
        component={PatientDetailsScreen}
        options={{ title: "Patient Details" }}
      />
      <Stack.Screen
        name={ScreenNames.EditPatient}
        component={EditPatientScreen}
        options={{ title: "Edit Patient" }}
      />
    </Stack.Navigator>
  );
}

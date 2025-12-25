import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenNames from "../ScreenNames";
import CompaniesScreen from "../../../screens/Company/CompaniesScreen";
import PersonsScreen from "../../../screens/Company/PersonsScreen";
import CreatePersonScreen from "../../../screens/Company/CreatePersonScreen";
import CreateCompanyScreen from "../../../screens/Company/CreateCompanyScreen";
import CompanyDetailsScreen from "../../../screens/Company/CompanyDetailsScreen";
import CompanyProfileScreen from "../../../screens/Company/CompanyProfileScreen";
import EditCompanyScreen from "../../../screens/Company/EditCompanyScreen";
import PersonDetailsScreen from "../../../screens/Company/PersonDetailsScreen";
import EditPersonScreen from "../../../screens/Company/EditPersonScreen";
import DealsScreen from "../../../screens/Company/DealsScreen";
import CreateDealScreen from "../../../screens/Company/CreateDealScreen";
import CompanyAppointmentsScreen from "../../../screens/Company/CompanyAppointmentsScreen";
import BookAppointmentScreen from "../../../screens/Appointment/BookAppointmentScreen";
import AppointmentDetailsScreen from "../../../screens/Appointment/AppointmentDetailsScreen";
import EditAppointmentScreen from "../../../screens/EditAppointment/EditAppointmentScreen";
import { ErrorBoundary } from "../../components/ErrorBoundary";

const Stack = createNativeStackNavigator();

export default function CompaniesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ScreenNames.CompaniesScreen}
        options={{ title: "Companies" }}
      >
        {() => (
          <ErrorBoundary name="CompaniesScreen">
            <CompaniesScreen />
          </ErrorBoundary>
        )}
      </Stack.Screen>
      <Stack.Screen
        name={ScreenNames.CreateCompanyScreen}
        component={CreateCompanyScreen}
        options={{ title: "New Company" }}
      />
      <Stack.Screen
        name={ScreenNames.CompanyDetailsScreen}
        component={CompanyDetailsScreen}
        options={{ title: "Company Details" }}
      />
      <Stack.Screen
        name={ScreenNames.CompanyProfileScreen}
        component={CompanyProfileScreen}
        options={{ title: "Company Profile" }}
      />
      <Stack.Screen
        name={ScreenNames.EditCompanyScreen}
        component={EditCompanyScreen}
        options={{ title: "Edit Company" }}
      />
      <Stack.Screen
        name={ScreenNames.PersonsScreen}
        component={PersonsScreen}
        options={{ title: "Persons" }}
      />
      <Stack.Screen
        name={ScreenNames.PersonDetailsScreen}
        component={PersonDetailsScreen}
        options={{ title: "Person Details" }}
      />
      <Stack.Screen
        name={ScreenNames.EditPersonScreen}
        component={EditPersonScreen}
        options={{ title: "Edit Person" }}
      />
      <Stack.Screen
        name={ScreenNames.CreatePersonScreen}
        component={CreatePersonScreen}
        options={{ title: "Add Person" }}
      />
      <Stack.Screen
        name={ScreenNames.DealsScreen}
        component={DealsScreen}
        options={{ title: "Deals" }}
      />
      <Stack.Screen
        name={ScreenNames.CreateDealScreen}
        component={CreateDealScreen}
        options={{ title: "New Deal" }}
      />
      <Stack.Screen
        name={ScreenNames.CompanyAppointmentsScreen}
        component={CompanyAppointmentsScreen}
        options={{ title: "Appointments" }}
      />
      <Stack.Screen
        name={ScreenNames.BookAppointmentScreen}
        component={BookAppointmentScreen}
        options={{ title: "Book Appointment" }}
      />
      <Stack.Screen
        name={ScreenNames.AppointmentDetails}
        component={AppointmentDetailsScreen}
        options={{ title: "Appointment Details" }}
      />
      <Stack.Screen
        name={ScreenNames.EditAppointment}
        component={EditAppointmentScreen}
        options={{ title: "Edit Appointment" }}
      />
    </Stack.Navigator>
  );
}

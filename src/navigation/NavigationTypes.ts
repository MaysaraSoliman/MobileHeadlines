import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import ScreenNames from "./ScreenNames";

export type RootStackParamList = {
  [ScreenNames.AuthScreen]: undefined;
  [ScreenNames.RegisterScreen]: undefined;
  [ScreenNames.HomeScreen]: undefined;
  [ScreenNames.ArticleDetails]: { article: any }; // Using any for article for now or import NewsArticle
  [ScreenNames.SettingsScreen]: undefined;
  [ScreenNames.EditProfileScreen]: undefined;
  [ScreenNames.BookAppointmentScreen]: {
    companyId?: string;
    personId?: string;
  };
  [ScreenNames.AppointmentsList]: undefined;
  [ScreenNames.AppointmentDetails]: { appointmentId: string };
  [ScreenNames.AddPatientScreen]: undefined;
  [ScreenNames.PatientsList]: undefined;
  [ScreenNames.PatientDetails]: { patientId: string };
  [ScreenNames.EditPatient]: { patient: any };
  [ScreenNames.EditAppointment]: { appointment: any };
  [ScreenNames.CompaniesScreen]: undefined;
  [ScreenNames.PersonsScreen]: { companyId: string; companyName: string };
  [ScreenNames.CreatePersonScreen]: {
    companyId: string;
    companyName: string;
  };
  [ScreenNames.CreateCompanyScreen]: undefined;
  [ScreenNames.CompanyDetailsScreen]: {
    companyId: string;
    companyName: string;
  };
  [ScreenNames.CompanyProfileScreen]: { companyId: string };
  [ScreenNames.EditCompanyScreen]: { companyId: string };
  [ScreenNames.DealsScreen]: { companyId: string; companyName: string };
  [ScreenNames.CreateDealScreen]: { companyId: string; companyName: string };
  [ScreenNames.CompanyAppointmentsScreen]: {
    companyId: string;
    companyName: string;
  };
  [ScreenNames.PersonDetailsScreen]: {
    personId: string;
    personName: string;
    companyId: string;
    companyName: string;
  };
  [ScreenNames.EditPersonScreen]: {
    person: any; // Using any for Person type to avoid circular dependencies or complex imports for now, or import Person type
    companyId: string;
  };
  [ScreenNames.CreateTaskScreen]: undefined;
  [ScreenNames.TaskDetailsScreen]: { taskId: string };
  [ScreenNames.TasksScreen]: undefined;
};

export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

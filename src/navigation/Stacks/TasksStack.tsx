import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TasksScreen from "../../../screens/Task/TasksScreen";
import CreateTaskScreen from "../../../screens/Task/CreateTaskScreen";
import TaskDetailsScreen from "../../../screens/Task/TaskDetailsScreen";
import ScreenNames from "../../navigation/ScreenNames";

const Stack = createNativeStackNavigator();

export default function TasksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ScreenNames.TasksScreen}
        component={TasksScreen}
        options={{ title: "Tasks" }}
      />
      <Stack.Screen
        name={ScreenNames.CreateTaskScreen}
        component={CreateTaskScreen}
        options={{ title: "Create Task" }}
      />
      <Stack.Screen
        name={ScreenNames.TaskDetailsScreen}
        component={TaskDetailsScreen}
        options={{ title: "Task Details" }}
      />
    </Stack.Navigator>
  );
}

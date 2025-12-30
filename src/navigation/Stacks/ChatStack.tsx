import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatListScreen from "../../../screens/Chat/ChatListScreen";
import ChatRoomScreen from "../../../screens/Chat/ChatRoomScreen";
import CreateChatScreen from "../../../screens/Chat/CreateChatScreen";

const Stack = createNativeStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: "Chats" }}
      />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen
        name="CreateChat"
        component={CreateChatScreen}
        options={{ title: "New Chat" }}
      />
    </Stack.Navigator>
  );
}

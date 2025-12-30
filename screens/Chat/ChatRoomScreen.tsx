import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useChat } from "../../src/context/ChatContext";

const GET_CHAT_MESSAGES = gql`
  query ChatMessages($chatId: ID!) {
    chatMessages(chatId: $chatId) {
      id
      content
      createdAt
      sender {
        id
        name
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: ID!, $content: String!) {
    sendMessage(chatId: $chatId, content: $content) {
      id
      content
      createdAt
      sender {
        id
        name
      }
    }
  }
`;

const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription MessageSent($chatId: ID!) {
    messageSent(chatId: $chatId) {
      id
      content
      createdAt
      sender {
        id
        name
      }
    }
  }
`;

export default function ChatRoomScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { chatId, name } = route.params;
  const { user } = useAuth(); // Assuming useAuth provides the current user
  const { markAsRead, setCurrentChatId } = useChat();
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom (top of inverted list) when keyboard opens
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => {
      showSubscription.remove();
    };
  }, []);

  // Set current chat ID for unread count logic
  // When we are in this screen, unread count for this chat should remain 0
  // and new messages should be marked as read immediately
  useEffect(() => {
    navigation.setOptions({ title: name || "Chat" });
    setCurrentChatId(chatId);
    markAsRead(chatId);

    return () => {
      setCurrentChatId(null);
    };
  }, [name, navigation, chatId]);

  const { data, loading, error, subscribeToMore } = useQuery(
    GET_CHAT_MESSAGES,
    {
      variables: { chatId },
      fetchPolicy: "cache-and-network",
    }
  );

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: MESSAGE_SENT_SUBSCRIPTION,
      variables: { chatId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newMessage = subscriptionData.data.messageSent;

        // Check if message already exists (optimistic update or duplicate)
        if (prev.chatMessages.some((msg: any) => msg.id === newMessage.id)) {
          return prev;
        }

        return {
          ...prev,
          chatMessages: [newMessage, ...prev.chatMessages],
        };
      },
    });
    return () => unsubscribe();
  }, [chatId, subscribeToMore]);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    // onCompleted: () => setMessageText(""), // Moved to handleSend for better control
  });

  const handleSend = async () => {
    if (!messageText.trim()) return;

    const contentToSend = messageText;
    // Clear immediately for better UX
    setMessageText("");

    try {
      await sendMessage({
        variables: {
          chatId,
          content: contentToSend,
        },
        optimisticResponse: {
          sendMessage: {
            __typename: "Message",
            id: `temp-${Date.now()}`,
            content: contentToSend,
            createdAt: new Date().toISOString(),
            sender: {
              __typename: "User",
              id: user?.id || "temp-id",
              name: user?.name || "Me",
            },
          },
        },
        update: (cache, { data: { sendMessage } }) => {
          const existingData: any = cache.readQuery({
            query: GET_CHAT_MESSAGES,
            variables: { chatId },
          });

          if (existingData) {
            // Check if the message is already in the cache (e.g. from subscription)
            if (
              existingData.chatMessages.some(
                (msg: any) => msg.id === sendMessage.id
              )
            ) {
              return;
            }

            cache.writeQuery({
              query: GET_CHAT_MESSAGES,
              variables: { chatId },
              data: {
                chatMessages: [sendMessage, ...existingData.chatMessages],
              },
            });
          }
        },
      });
    } catch (e) {
      console.error("Error sending message:", e);
      // Restore text if failed
      setMessageText(contentToSend);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMe = item.sender.id === user?.id;
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {!isMe && <Text style={styles.senderName}>{item.sender.name}</Text>}
        <Text
          style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  if (loading && !data) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error.message}</Text>;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={"padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 100}
    >
      <FlatList
        ref={flatListRef}
        data={data?.chatMessages || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          style={styles.sendButton}
          disabled={!messageText.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={messageText.trim() ? "#007AFF" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 10,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 2,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 2,
  },
  senderName: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    padding: 5,
  },
});

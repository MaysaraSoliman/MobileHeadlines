import React, { createContext, useContext, useState, useEffect } from "react";
import {
  gql,
  useQuery,
  useSubscription,
  useMutation,
  useApolloClient,
} from "@apollo/client";
import { useAuth } from "./AuthContext";
import * as Notifications from "expo-notifications";

const GET_UNREAD_COUNT = gql`
  query UnreadMessageCount {
    unreadMessageCount
  }
`;

const MARK_CHAT_READ = gql`
  mutation MarkChatAsRead($chatId: ID!) {
    markChatAsRead(chatId: $chatId)
  }
`;

const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription MessageReceived($userId: ID!) {
    messageReceived(userId: $userId) {
      id
      content
      chat {
        id
      }
      sender {
        id
        name
      }
    }
  }
`;

interface ChatContextType {
  unreadCount: number;
  markAsRead: (chatId: string) => Promise<void>;
  currentChatId: string | null;
  setCurrentChatId: (chatId: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const client = useApolloClient();

  // Initial fetch of unread count
  const { data, refetch } = useQuery(GET_UNREAD_COUNT, {
    skip: !user,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      setUnreadCount(data.unreadMessageCount || 0);
    },
  });

  // Refetch when user changes
  useEffect(() => {
    if (user) {
      refetch();
    } else {
      setUnreadCount(0);
    }
  }, [user, refetch]);

  // Subscribe to new messages
  useSubscription(MESSAGE_RECEIVED_SUBSCRIPTION, {
    variables: { userId: user?.id },
    skip: !user,
    onData: ({ data }) => {
      console.log(
        "🔔 Subscription received data:",
        JSON.stringify(data, null, 2)
      );
      const message = data.data?.messageReceived;
      if (message) {
        // If we are currently in this chat, mark as read immediately (or don't increment)
        if (currentChatId === message.chat.id) {
          // Optionally call mutation here if you want backend to know immediately
          markAsRead(message.chat.id);
        } else {
          // Increment badge count
          setUnreadCount((prev) => {
            console.log(
              "📈 Incrementing unread count. Previous:",
              prev,
              "New:",
              prev + 1
            );
            return prev + 1;
          });

          // Show notification
          Notifications.scheduleNotificationAsync({
            content: {
              title: message.sender.name,
              body: message.content,
              data: { chatId: message.chat.id },
            },
            trigger: null,
          });
        }
      }
    },
    onError: (err) => {
      console.error("🔴 Subscription error:", err);
    },
  });

  const [markChatAsReadMutation] = useMutation(MARK_CHAT_READ);

  const markAsRead = async (chatId: string) => {
    try {
      await markChatAsReadMutation({ variables: { chatId } });
      // Refetch count to ensure accuracy
      const { data } = await refetch();
      if (data) {
        setUnreadCount(data.unreadMessageCount);
      }
    } catch (e) {
      console.error("Error marking chat as read:", e);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        unreadCount,
        markAsRead,
        currentChatId,
        setCurrentChatId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

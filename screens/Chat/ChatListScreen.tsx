import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  useQuery,
  useSubscription,
  useApolloClient,
  gql,
} from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { useChat } from "../../src/context/ChatContext";
import { Ionicons } from "@expo/vector-icons";

const GET_MY_CHATS = gql`
  query MyChats {
    myChats {
      id
      name
      isGroup
      participants {
        user {
          id
          name
          email
        }
      }
      messages {
        content
        createdAt
      }
      updatedAt
      unreadCount
    }
  }
`;

const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription OnMessageReceived($userId: ID!) {
    messageReceived(userId: $userId) {
      id
      content
      createdAt
      sender {
        id
      }
      chat {
        id
        name
        isGroup
        participants {
          user {
            id
            name
            email
          }
        }
        updatedAt
      }
    }
  }
`;

export default function ChatListScreen() {
  const { data, loading, error, refetch } = useQuery(GET_MY_CHATS, {
    fetchPolicy: "cache-first", // Changed from cache-and-network to avoid overwriting real-time updates with stale network data
  });
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { currentChatId } = useChat();
  const client = useApolloClient();

  // Local state for immediate UI updates
  const [localChats, setLocalChats] = React.useState<any[]>([]);

  // Sync local state with Apollo cache data
  useEffect(() => {
    if (data?.myChats) {
      setLocalChats(data.myChats);
    }
  }, [data]);

  // Real-time subscription for new messages
  useSubscription(MESSAGE_RECEIVED_SUBSCRIPTION, {
    variables: { userId: user?.id },
    skip: !user,
    onData: ({ data }: { data: any }) => {
      const newMessage = data.data?.messageReceived;
      if (!newMessage) return;

      const chat = newMessage.chat;

      // Update Local State IMMEDIATELY
      setLocalChats((prevChats) => {
        const existingChatIndex = prevChats.findIndex((c) => c.id === chat.id);
        let newChats = [...prevChats];

        if (existingChatIndex > -1) {
          const existingChat = newChats[existingChatIndex];

          // Duplicate check
          if (
            existingChat.messages[0]?.content === newMessage.content &&
            existingChat.messages[0]?.createdAt === newMessage.createdAt
          ) {
            return prevChats;
          }

          let newUnreadCount = existingChat.unreadCount || 0;
          newUnreadCount = Number.parseInt(String(newUnreadCount), 10);

          if (chat.id !== currentChatId) {
            newUnreadCount += 1;
          }

          const updatedChat = {
            ...existingChat,
            ...chat,
            unreadCount: newUnreadCount,
            messages: [
              {
                __typename: "Message",
                content: newMessage.content,
                createdAt: newMessage.createdAt,
              },
            ],
            updatedAt: newMessage.createdAt,
          };

          newChats.splice(existingChatIndex, 1);
          newChats.unshift(updatedChat);
        } else {
          const newChat = {
            ...chat,
            messages: [
              {
                __typename: "Message",
                content: newMessage.content,
                createdAt: newMessage.createdAt,
              },
            ],
            unreadCount: chat.id === currentChatId ? 0 : 1,
            __typename: "Chat",
          };
          newChats.unshift(newChat);
        }
        return newChats;
      });

      try {
        // Also update Apollo Cache for consistency (background)
        const existingData: any = client.readQuery({ query: GET_MY_CHATS });

        if (!existingData?.myChats) return;

        // Reuse logic for cache update
        const existingChatIndex = existingData.myChats.findIndex(
          (c: any) => c.id === chat.id
        );

        let newMyChats = [...existingData.myChats];

        if (existingChatIndex > -1) {
          const existingChat = newMyChats[existingChatIndex];
          if (
            existingChat.messages[0]?.content === newMessage.content &&
            existingChat.messages[0]?.createdAt === newMessage.createdAt
          ) {
            return;
          }

          let newUnreadCount = existingChat.unreadCount || 0;
          newUnreadCount = Number.parseInt(String(newUnreadCount), 10);
          if (chat.id !== currentChatId) newUnreadCount += 1;

          const updatedChat = {
            ...existingChat,
            ...chat,
            unreadCount: newUnreadCount,
            messages: [
              {
                __typename: "Message",
                content: newMessage.content,
                createdAt: newMessage.createdAt,
              },
            ],
            updatedAt: newMessage.createdAt,
          };
          newMyChats.splice(existingChatIndex, 1);
          newMyChats.unshift(updatedChat);
        } else {
          const newChat = {
            ...chat,
            messages: [
              {
                __typename: "Message",
                content: newMessage.content,
                createdAt: newMessage.createdAt,
              },
            ],
            unreadCount: chat.id === currentChatId ? 0 : 1,
            __typename: "Chat",
          };
          newMyChats.unshift(newChat);
        }

        client.writeQuery({
          query: GET_MY_CHATS,
          data: {
            myChats: newMyChats,
          },
        });
      } catch (e) {
        console.error("Error updating cache in ChatListScreen:", e);
      }
    },
    onError: (err) => {
      console.error("🔴 ChatList Subscription Error:", err);
    },
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateChat")}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Refetch when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("🔄 ChatListScreen focused, refetching...");
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  if (loading && !data) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error.message}</Text>;

  const renderItem = ({ item }: { item: any }) => {
    const otherParticipants = item.participants.filter(
      (p: any) => p.user.id !== user?.id
    );
    const chatName =
      item.name ||
      otherParticipants.map((p: any) => p.user.name).join(", ") ||
      "Chat";
    const lastMessage = item.messages?.[0]?.content || "No messages yet";

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          navigation.navigate("ChatRoom", { chatId: item.id, name: chatName })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {chatName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{chatName}</Text>
          <Text style={styles.message} numberOfLines={1}>
            {lastMessage}
          </Text>
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.unreadCount > 99 ? "99+" : item.unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={localChats}
        extraData={localChats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 10,
  },
  item: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  message: {
    color: "#666",
    fontSize: 14,
  },
  badge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    marginLeft: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

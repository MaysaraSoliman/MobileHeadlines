import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useQuery, gql } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
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
    }
  }
`;

export default function ChatListScreen() {
  const { data, loading, error, refetch } = useQuery(GET_MY_CHATS, {
    fetchPolicy: "cache-and-network",
  });
  const navigation = useNavigation<any>();
  const { user } = useAuth();

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

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
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
    // For now, just show the chat name or participants
    const chatName =
      item.name ||
      otherParticipants.map((p: any) => p.user.name).join(", ") ||
      "Chat";
    const lastMessage = item.messages[0]?.content || "No messages yet";

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
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={data?.myChats || []}
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
});

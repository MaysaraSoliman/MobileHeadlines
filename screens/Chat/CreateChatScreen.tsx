import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

const CREATE_CHAT = gql`
  mutation CreateChat($userIds: [ID!]!, $name: String) {
    createChat(userIds: $userIds, name: $name) {
      id
      name
      isGroup
      participants {
        user {
          id
          name
        }
      }
    }
  }
`;

export default function CreateChatScreen() {
  const navigation = useNavigation<any>();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  
  const { data, loading, error } = useQuery(GET_USERS);
  const [createChat, { loading: creating }] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      navigation.replace("ChatRoom", {
        chatId: data.createChat.id,
        name: data.createChat.name || "Chat",
      });
    },
    onError: (err) => {
      Alert.alert("Error", err.message);
    },
    refetchQueries: ["MyChats"], // Refetch chat list
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateChat = () => {
    if (selectedUserIds.length === 0) {
      Alert.alert("Error", "Please select at least one user.");
      return;
    }
    
    // If multiple users, require a group name (optional but good UX)
    // For now, allow empty group name
    
    createChat({
      variables: {
        userIds: selectedUserIds,
        name: groupName.trim() || null,
      },
    });
  };

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error.message}</Text>;

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedUserIds.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => toggleUserSelection(item.id)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        {selectedUserIds.length > 1 && (
          <TextInput
            style={styles.input}
            placeholder="Group Name (Optional)"
            value={groupName}
            onChangeText={setGroupName}
          />
        )}
      </View>

      <FlatList
        data={data?.users || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, selectedUserIds.length === 0 && styles.disabledButton]}
          onPress={handleCreateChat}
          disabled={selectedUserIds.length === 0 || creating}
        >
          {creating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {selectedUserIds.length > 1 ? "Create Group Chat" : "Start Chat"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  selectedItem: {
    backgroundColor: "#e3f2fd",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

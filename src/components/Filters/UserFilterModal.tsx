import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface UserFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  selectedUserId: string;
  users: User[];
  loading?: boolean;
  error?: any;
}

export const UserFilterModal: React.FC<UserFilterModalProps> = ({
  visible,
  onClose,
  onSelectUser,
  selectedUserId,
  users,
  loading,
  error,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(lowerQuery) ||
        user.email?.toLowerCase().includes(lowerQuery)
    );
  }, [users, searchQuery]);

  const renderItem = ({ item }: { item: User }) => {
    const isSelected = selectedUserId === item.id;
    const initials = item.name
      ? item.name.charAt(0).toUpperCase()
      : item.email.charAt(0).toUpperCase();

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.selectedUserItem]}
        onPress={() => {
          onSelectUser(item.id);
          onClose();
        }}
      >
        <View style={styles.userInfo}>
          <View style={[styles.avatar, isSelected && styles.selectedAvatar]}>
            <Text
              style={[
                styles.avatarText,
                isSelected && styles.selectedAvatarText,
              ]}
            >
              {initials}
            </Text>
          </View>
          <View>
            <Text
              style={[styles.userName, isSelected && styles.selectedUserName]}
            >
              {item.name || "Unknown User"}
            </Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      <TouchableOpacity
        style={[
          styles.userItem,
          selectedUserId === "all" && styles.selectedUserItem,
        ]}
        onPress={() => {
          onSelectUser("all");
          onClose();
        }}
      >
        <View style={styles.userInfo}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: "#e3f2fd" },
              selectedUserId === "all" && styles.selectedAvatar,
            ]}
          >
            <Ionicons
              name="people"
              size={20}
              color={selectedUserId === "all" ? "white" : "#007AFF"}
            />
          </View>
          <Text
            style={[
              styles.userName,
              selectedUserId === "all" && styles.selectedUserName,
            ]}
          >
            All Users
          </Text>
        </View>
        {selectedUserId === "all" && (
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
        )}
      </TouchableOpacity>
      <View style={styles.divider} />
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
          <Text style={styles.errorText}>Failed to load users</Text>
          <Text style={styles.errorSubText}>{error.message}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
      />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter by User</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  listContent: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedUserItem: {
    backgroundColor: "#f0f9ff",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedAvatar: {
    backgroundColor: "#007AFF",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  selectedAvatarText: {
    color: "white",
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  selectedUserName: {
    color: "#007AFF",
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  errorSubText: {
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
});

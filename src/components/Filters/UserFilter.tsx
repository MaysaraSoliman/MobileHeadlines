import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserFilterProps {
  users: User[];
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
}

export const UserFilter: React.FC<UserFilterProps> = ({
  users,
  selectedUserId,
  onSelectUser,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.chip,
            selectedUserId === "all" && styles.activeChip,
          ]}
          onPress={() => onSelectUser("all")}
        >
          <Ionicons
            name="people"
            size={16}
            color={selectedUserId === "all" ? "white" : "#666"}
          />
          <Text
            style={[
              styles.chipText,
              selectedUserId === "all" && styles.activeChipText,
            ]}
          >
            All Users
          </Text>
        </TouchableOpacity>

        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={[
              styles.chip,
              selectedUserId === user.id && styles.activeChip,
            ]}
            onPress={() => onSelectUser(user.id)}
          >
            <Ionicons
              name="person"
              size={14}
              color={selectedUserId === user.id ? "white" : "#666"}
            />
            <Text
              style={[
                styles.chipText,
                selectedUserId === user.id && styles.activeChipText,
              ]}
            >
              {user.name || user.email.split("@")[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  activeChip: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  chipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  activeChipText: {
    color: "white",
    fontWeight: "600",
  },
});

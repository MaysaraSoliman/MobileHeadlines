import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ScreenStacks from "../../src/navigation/ScreenStacks";
import ScreenNames from "../../src/navigation/ScreenNames";
import { useAuth } from "../../src/context/AuthContext";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { user, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  }, [refreshUser]);

  const sections = [
    {
      items: [
        {
          icon: "create-outline",
          label: "Edit Profile",
          type: "ionicons",
          screen: ScreenNames.EditProfileScreen,
        },
        {
          icon: "settings-outline",
          label: "Account Settings",
          type: "ionicons",
        },
        {
          icon: "phone-portrait-outline",
          label: "App Settings",
          type: "ionicons",
        },
      ],
    },
    {
      items: [
        {
          icon: "help-circle-outline",
          label: "Help & Support",
          type: "ionicons",
        },
        {
          icon: "share-outline",
          label: "Share Jetpack with a friend",
          type: "ionicons",
        },
        {
          icon: "information-circle-outline",
          label: "About Jetpack for iOS",
          type: "ionicons",
        },
      ],
    },
    {
      items: [{ icon: "language", label: "All Domains", type: "material" }],
    },
  ];

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: ScreenStacks.AuthStack }],
    });
  };

  const handlePress = (item: any) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.contentContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../assets/images.png")} // Using the same asset as Header
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || "User Name"}</Text>
          <View style={styles.emailContainer}>
            <Text style={styles.userEmail}>
              {user?.email || "user@email.com"}
            </Text>
          </View>
        </View>

        {sections.map((section, sectionIndex) => (
          <View key={`section-${sectionIndex}`} style={styles.section}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={`item-${item.label}`}
                style={[
                  styles.row,
                  itemIndex === section.items.length - 1 && styles.lastRow,
                ]}
                onPress={() => handlePress(item)}
              >
                <View style={styles.rowLeft}>
                  {item.type === "ionicons" ? (
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color="#666"
                      style={styles.icon}
                    />
                  ) : (
                    <MaterialIcons
                      name={item.icon as any}
                      size={22}
                      color="#666"
                      style={styles.icon}
                    />
                  )}
                  <Text style={styles.rowLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
  },
  contentContainer: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  emailContainer: {
    backgroundColor: "#e1f0ff",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  userEmail: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
    width: 24,
    textAlign: "center",
  },
  rowLabel: {
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff3b30",
  },
  logoutText: {
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "600",
  },
});

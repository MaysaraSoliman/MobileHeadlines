import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ScreenStacks from "../../src/navigation/ScreenStacks";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();

  const sections = [
    {
      items: [
        { icon: "person", label: "My Profile", type: "ionicons" },
        { icon: "settings", label: "Account Settings", type: "ionicons" },
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
          icon: "flash-outline",
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.row,
                  itemIndex === section.items.length - 1 && styles.lastRow,
                ]}
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
    backgroundColor: "#f2f2f7",
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#c6c6c8",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  rowLabel: {
    fontSize: 16,
    color: "#000",
  },
  footerText: {
    fontSize: 13,
    color: "#8e8e93",
    marginBottom: 8,
    marginLeft: 16,
    textTransform: "uppercase",
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutText: {
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "600",
  },
});

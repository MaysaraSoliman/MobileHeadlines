import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenStacks from "../../navigation/ScreenStacks";
import ScreenNames from "../../navigation/ScreenNames";

export default function Header({ userName }: Readonly<{ userName?: string }>) {
  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleNewPatient = () => {
    setMenuVisible(false);
    navigation.navigate(ScreenNames.AddPatientScreen);
  };

  const handleNewAppointment = () => {
    setMenuVisible(false);
    // Navigate to Appointment Stack -> BookAppointment
    navigation.navigate(ScreenStacks.AppointmentsStack, {
      screen: ScreenNames.BookAppointmentScreen,
    });
  };

  const handleNewTask = () => {
    setMenuVisible(false);
    navigation.navigate(ScreenNames.CreateTaskScreen);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate(ScreenStacks.SettingsStack)}
      >
        <Image
          source={require("../../../assets/images.png")}
          style={styles.image}
        />
      </TouchableOpacity>

      <View style={styles.rightContainer}>
        <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
          <Ionicons name="add-circle-outline" size={32} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleNewPatient}
                >
                  <Text style={styles.menuText}>New Patient</Text>
                  <Ionicons name="add" size={20} color="#4CD964" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleNewAppointment}
                >
                  <Text style={styles.menuText}>New Appointment</Text>
                  <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleNewTask}
                >
                  <Text style={styles.menuText}>New Task</Text>
                  <Ionicons name="checkbox-outline" size={20} color="#FF9500" />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    zIndex: 10,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  text: {
    color: "red",
    fontSize: 20,
    fontWeight: "bold",
  },
  subText: {
    color: "#333",
    fontSize: 14,
  },
  image: {
    width: 50,
    height: 50,
    backgroundColor: "transparent",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    width: "80%",
    backgroundColor: "#1c2a38", // Dark theme like the image
    borderRadius: 12,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  menuText: {
    fontSize: 16,
    color: "#fff", // White text for dark background
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#2c3e50",
  },
});

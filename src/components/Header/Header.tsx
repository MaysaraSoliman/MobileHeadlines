import React from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenStacks from "../../navigation/ScreenStacks";

export default function Header({ userName }: { userName?: string }) {
  const navigation = useNavigation<any>();

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
      <Image
        source={require("../../../assets/notification-bell-icon.png")}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
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
});

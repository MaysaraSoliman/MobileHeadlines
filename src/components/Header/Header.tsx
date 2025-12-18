import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images.png")}
        style={styles.image}
      />
      <Text style={styles.text}>Dentolize App</Text>
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
  },
  image: {
    width: 50,
    height: 50,
    backgroundColor: "transparent",
  },
});

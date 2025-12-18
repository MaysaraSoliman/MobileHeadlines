import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text>FavoritesScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

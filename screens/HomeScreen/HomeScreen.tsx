import React from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../../src/components/Header/Header";
import Hero from "../../src/components/Hero/Hero";
import TopNews from "../../src/components/TopNews/TopNews";
import { useAuth } from "../../src/context/AuthContext";
import ScreenStacks from "../../src/navigation/ScreenStacks";

export default function HomeScreen() {
  const { user, loading, refreshUser } = useAuth();
  const navigation = useNavigation<any>();

  console.log("user", user);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TopNews
      onRefresh={refreshUser}
      ListHeaderComponent={
        <>
          <Header userName={user?.name} />
          <Hero />
          <View style={{ padding: 10 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate(ScreenStacks.CompaniesStack)}
            >
              <Text style={styles.buttonText}>Manage Companies</Text>
            </TouchableOpacity>
          </View>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

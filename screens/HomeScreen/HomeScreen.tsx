import React from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../../src/components/Header/Header";
import Hero from "../../src/components/Hero/Hero";
import TopNews from "../../src/components/TopNews/TopNews";
import { useAuth } from "../../src/context/AuthContext";

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
});

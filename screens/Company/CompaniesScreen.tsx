import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useQuery } from "@apollo/client";
import { GET_COMPANIES } from "../../src/graphql/queries/queries";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../src/navigation/NavigationTypes";
import ScreenNames from "../../src/navigation/ScreenNames";
import { Company } from "../../src/types/types";

import { Ionicons } from "@expo/vector-icons";

type CompaniesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  ScreenNames.CompaniesScreen
>;

export default function CompaniesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const { data, loading, error, refetch } = useQuery<{ companies: Company[] }>(
    GET_COMPANIES,
    {
      variables: { search: debouncedSearchQuery },
    }
  );
  const navigation = useNavigation<CompaniesScreenNavigationProp>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate(ScreenNames.CreateCompanyScreen)}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error.message}</Text>;

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate(ScreenNames.CompanyDetailsScreen, {
          companyId: item.id,
          companyName: item.name,
        })
      }
    >
      <Text style={styles.title}>{item.name}</Text>
      <Text>{item.email}</Text>
      <Text>{item.persons?.length || 0} Persons</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search companies..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="always"
      />
      <FlatList
        data={data?.companies}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No companies found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchInput: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
});

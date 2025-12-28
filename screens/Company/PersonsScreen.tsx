import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useQuery } from "@apollo/client/react";
import { GET_PERSONS_BY_COMPANY } from "../../src/graphql/queries/queries";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../src/navigation/NavigationTypes";
import ScreenNames from "../../src/navigation/ScreenNames";
import { Person } from "../../src/types/types";

type PersonsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  ScreenNames.PersonsScreen
>;
type PersonsScreenRouteProp = RouteProp<
  RootStackParamList,
  ScreenNames.PersonsScreen
>;

export default function PersonsScreen() {
  const route = useRoute<PersonsScreenRouteProp>();
  const { companyId, companyName } = route.params;
  const navigation = useNavigation<PersonsScreenNavigationProp>();
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

  const { data, loading, error, refetch } = useQuery<{
    personsByCompany: Person[];
  }>(GET_PERSONS_BY_COMPANY, {
    variables: { companyId, search: debouncedSearchQuery },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${companyName} - Persons`,
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() =>
            navigation.navigate(ScreenNames.CreatePersonScreen, {
              companyId,
              companyName,
            })
          }
        >
          <Ionicons name="add" size={30} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, companyName]);

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error.message}</Text>;

  const renderItem = ({ item }: { item: Person }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate(ScreenNames.PersonDetailsScreen, {
          personId: item.id,
          personName: `${item.firstName} ${item.lastName}`,
          companyId,
          companyName,
        })
      }
    >
      <Text style={styles.title}>
        {item.firstName} {item.lastName}
      </Text>
      <Text>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search persons..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="always"
      />
      <FlatList
        data={data?.personsByCompany}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No persons found</Text>
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
  role: { fontSize: 14, color: "#666", fontStyle: "italic", marginBottom: 2 },
  button: {
    marginTop: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
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

import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { useQuery } from "@apollo/client/react";
import { GET_COMPANIES } from "../../src/graphql/queries/queries";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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
  const [isReady, setIsReady] = useState(Platform.OS !== "ios"); // Delay render on iOS
  const isMounted = React.useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Small delay on iOS to allow navigation transition to complete before heavy render
      if (Platform.OS === "ios") {
        const timer = setTimeout(() => {
          if (isMounted.current) {
            setIsReady(true);
          }
        }, 350);
        return () => clearTimeout(timer);
      }
    }, [])
  );

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
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      skip: !isReady, // Skip query until screen is ready
    }
  );
  const navigation = useNavigation<CompaniesScreenNavigationProp>();

  useLayoutEffect(() => {
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

  // Safe render function for individual items
  const renderItem = ({ item }: { item: Company | null | undefined }) => {
    if (!item) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate(ScreenNames.CompanyDetailsScreen, {
            companyId: item.id,
            companyName: item.name || "Unknown Company",
          })
        }
      >
        <Text style={styles.title}>{item.name || "Unnamed Company"}</Text>
        <Text>{item.email || "No email"}</Text>
        <Text>{item.persons?.length || 0} Persons</Text>
      </TouchableOpacity>
    );
  };

  // Initial loading state or waiting for iOS transition
  if (!isReady || (loading && !data?.companies)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const companies = data?.companies || [];

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search companies..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="always"
        autoCorrect={false}
      />

      {loading && (
        <ActivityIndicator
          style={styles.loadingIndicator}
          size="small"
          color="#007AFF"
        />
      )}

      <FlatList
        data={companies}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No companies found</Text>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
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
  loadingIndicator: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  listContent: {
    paddingBottom: 20,
  },
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
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 16,
  },
  retryButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
});

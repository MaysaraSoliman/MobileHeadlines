import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@apollo/client";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GET_COMPANY } from "../../src/graphql/queries/queries";
import { RootStackParamList } from "../../src/navigation/NavigationTypes";
import ScreenNames from "../../src/navigation/ScreenNames";
import { Ionicons } from "@expo/vector-icons";

type DealsScreenRouteProp = RouteProp<
  RootStackParamList,
  ScreenNames.DealsScreen
>;
type DealsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  ScreenNames.DealsScreen
>;

export default function DealsScreen() {
  const navigation = useNavigation<DealsScreenNavigationProp>();
  const route = useRoute<DealsScreenRouteProp>();
  const { companyId, companyName } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Deals",
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() =>
            navigation.navigate(ScreenNames.CreateDealScreen, {
              companyId,
              companyName,
            })
          }
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, companyId, companyName]);

  const { data, loading, error, refetch } = useQuery(GET_COMPANY, {
    variables: { id: companyId },
  });

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error.message}</Text>;

  const deals = data?.company?.deals || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WON":
        return "#4CD964";
      case "LOST":
        return "#FF3B30";
      default:
        return "#FFCC00";
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.amount}>${item.amount.toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={deals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              No deals found for this company.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContainer: { padding: 15 },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: "bold" },
  amount: { fontSize: 16, color: "#666", marginTop: 5 },
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

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@apollo/client/react";
import { GET_PATIENTS } from "../../graphql/queries/queries";
import { Ionicons } from "@expo/vector-icons";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface Props {
  onSelect: (patient: Patient) => void;
  onClose: () => void;
}

export default function PatientSelector({
  onSelect,
  onClose,
}: Readonly<Props>) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error } = useQuery<any>(GET_PATIENTS, {
    variables: { search: debouncedSearch },
    fetchPolicy: "network-only",
  });

  const renderItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.firstName[0]}
          {item.lastName[0]}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Patient</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone"
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={data?.patients || []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No patients found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 18, fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    margin: 15,
    padding: 10,
    borderRadius: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e1f5fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { fontSize: 18, fontWeight: "bold", color: "#0288d1" },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  phone: { fontSize: 14, color: "#666" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#999" },
});

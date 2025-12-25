import React, { useState, useCallback, useLayoutEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  RefreshControl,
  Alert,
} from "react-native";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";

import { GET_TASKS, GET_USERS } from "../../src/graphql/queries/queries";
import { UPDATE_TASK } from "../../src/graphql/mutations/mutations";
import ScreenNames from "../../src/navigation/ScreenNames";
import { TaskCard } from "../../src/components/Task/TaskCard";
import { CalendarFilter } from "../../src/components/Filters/CalendarFilter";
import { UserFilterModal } from "../../src/components/Filters/UserFilterModal";
import { FilterHint } from "../../src/components/Filters/FilterHint";
import { TaskStatusModal } from "../../src/components/Task/TaskStatusModal";

export default function TasksScreen() {
  const navigation = useNavigation<any>();

  // State
  const [viewMode, setViewMode] = useState<"date" | "all">("date");
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [showUserFilterModal, setShowUserFilterModal] = useState(false);

  // Status Modal State
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Queries
  const { data: usersData } = useQuery(GET_USERS);

  const getFilter = () => {
    const filter: any = {};
    if (viewMode === "date") {
      filter.dueDate = selectedDate;
    }
    if (selectedUserId !== "all") {
      filter.assignedToId = selectedUserId;
    }
    return filter;
  };

  const { data, loading, error, refetch } = useQuery(GET_TASKS, {
    variables: { filter: getFilter() },
    fetchPolicy: "cache-and-network",
  });

  const [updateTask] = useMutation(UPDATE_TASK);

  // Derived State
  const selectedUser = useMemo(() => {
    if (selectedUserId === "all" || !usersData?.users) return null;
    return usersData.users.find((u: any) => u.id === selectedUserId) || null;
  }, [selectedUserId, usersData]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedTask) return;

    try {
      await updateTask({
        variables: {
          input: {
            id: selectedTask.id,
            status: newStatus,
          },
        },
        optimisticResponse: {
          updateTask: {
            ...selectedTask,
            status: newStatus,
            __typename: "Task",
          },
        },
      });
      setStatusModalVisible(false);
      setSelectedTask(null);
    } catch (e: any) {
      Alert.alert("Error", "Failed to update task status: " + e.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch, viewMode, selectedDate, selectedUserId])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Tasks",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowUserFilterModal(true)}
          style={{ marginRight: 15 }}
        >
          <Ionicons
            name={selectedUserId === "all" ? "filter-outline" : "filter"}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedUserId]);

  const renderEmpty = () => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
          <Text style={styles.emptyText}>Something went wrong</Text>
          <Text style={styles.emptySubText}>{error.message}</Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 15 }}>
            <Text style={{ color: "#007AFF", fontSize: 16 }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-done-circle-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No tasks found</Text>
        <Text style={styles.emptySubText}>
          {viewMode === "date"
            ? `No tasks for ${dayjs(selectedDate).format("MMM DD")}`
            : "No tasks found"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CalendarFilter
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        isOpen={isCalendarOpen}
        onToggle={() => setIsCalendarOpen(!isCalendarOpen)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <FilterHint
        viewMode={viewMode}
        selectedDate={selectedDate}
        selectedUser={selectedUser}
        onClearUser={() => setSelectedUserId("all")}
      />

      <UserFilterModal
        visible={showUserFilterModal}
        onClose={() => setShowUserFilterModal(false)}
        onSelectUser={setSelectedUserId}
        selectedUserId={selectedUserId}
        users={usersData?.users || []}
      />

      {loading && !data ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={data?.tasks || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() =>
                navigation.navigate(ScreenNames.TaskDetailsScreen, {
                  taskId: item.id,
                })
              }
              onStatusChange={() => {
                setSelectedTask(item);
                setStatusModalVisible(true);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} />
          }
        />
      )}

      <TaskStatusModal
        visible={statusModalVisible}
        onClose={() => {
          setStatusModalVisible(false);
          setSelectedTask(null);
        }}
        onSelectStatus={handleStatusUpdate}
        currentStatus={selectedTask?.status}
      />

      {/* FAB to Create Task */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate(ScreenNames.CreateTaskScreen)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

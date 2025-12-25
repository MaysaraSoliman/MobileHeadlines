import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";

interface CalendarFilterProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  viewMode: "date" | "all";
  onViewModeChange: (mode: "date" | "all") => void;
}

export const CalendarFilter: React.FC<CalendarFilterProps> = ({
  selectedDate,
  onDateSelect,
  isOpen,
  onToggle,
  viewMode,
  onViewModeChange,
}) => {
  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: "#007AFF",
    },
  };

  const handlePrevDay = () => {
    const prevDate = dayjs(selectedDate)
      .subtract(1, "day")
      .format("YYYY-MM-DD");
    onDateSelect(prevDate);
  };

  const handleNextDay = () => {
    const nextDate = dayjs(selectedDate).add(1, "day").format("YYYY-MM-DD");
    onDateSelect(nextDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, viewMode === "date" && styles.activeTab]}
            onPress={() => onViewModeChange("date")}
          >
            <Text
              style={[
                styles.tabText,
                viewMode === "date" && styles.activeTabText,
              ]}
            >
              By Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, viewMode === "all" && styles.activeTab]}
            onPress={() => onViewModeChange("all")}
          >
            <Text
              style={[
                styles.tabText,
                viewMode === "all" && styles.activeTabText,
              ]}
            >
              All Tasks
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === "date" && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity onPress={handlePrevDay} style={styles.navButton}>
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateSelector} onPress={onToggle}>
              <Ionicons
                name="calendar"
                size={20}
                color="#007AFF"
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>
                {dayjs(selectedDate).format("ddd, MMM D, YYYY")}
              </Text>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color="#666"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNextDay} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isOpen && viewMode === "date" && (
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: DateData) => {
              onDateSelect(day.dateString);
              onToggle(); // Close on select
            }}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: "#007AFF",
              todayTextColor: "#007AFF",
              arrowColor: "#007AFF",
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "bold",
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    zIndex: 10,
  },
  header: {
    padding: 12,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 3,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    padding: 8,
  },
  dateSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f8ff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dbeafe",
    marginHorizontal: 8,
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    marginRight: 8,
  },
  calendarContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";

interface CalendarFilterProps {
  /** Currently selected date. If null, represents "All Dates" */
  date: Date | null;
  /** Callback when date changes or "All Dates" is selected (null) */
  onDateChange: (date: Date | null) => void;
  /** Whether to show the "All Dates" / "By Date" toggle tabs */
  allowAllDates?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Custom active color (default: #007AFF) */
  activeColor?: string;
  /** Optional container style */
  style?: ViewStyle;
}

export const CalendarFilter: React.FC<CalendarFilterProps> = ({
  date,
  onDateChange,
  allowAllDates = true,
  minDate,
  maxDate,
  activeColor = "#007AFF",
  style,
}) => {
  // Internal visibility state
  const [isOpen, setIsOpen] = useState(false);

  // Format date to YYYY-MM-DD for react-native-calendars
  const formatDate = (d: Date) => dayjs(d).format("YYYY-MM-DD");

  const selectedDateStr = date
    ? formatDate(date)
    : dayjs().format("YYYY-MM-DD");

  // Navigation state (current visible month)
  const [currentMonth, setCurrentMonth] = useState(selectedDateStr);

  // Sync current month when date changes externally
  useEffect(() => {
    if (date) {
      setCurrentMonth(formatDate(date));
    }
  }, [date]);

  const markedDates = date
    ? {
        [formatDate(date)]: {
          selected: true,
          selectedColor: activeColor,
        },
      }
    : {};

  const handleDateSelect = (day: DateData) => {
    // Create date at noon to avoid timezone rollover issues
    const newDate = dayjs(day.dateString).hour(12).toDate();
    onDateChange(newDate);
    setIsOpen(false);
  };

  const handlePrevDay = () => {
    if (!date) return;
    const prevDate = dayjs(date).subtract(1, "day").toDate();
    onDateChange(prevDate);
  };

  const handleNextDay = () => {
    if (!date) return;
    const nextDate = dayjs(date).add(1, "day").toDate();
    onDateChange(nextDate);
  };

  const changeYear = (increment: number) => {
    const newMonth = dayjs(currentMonth)
      .add(increment, "year")
      .format("YYYY-MM-DD");
    setCurrentMonth(newMonth);
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        {allowAllDates && (
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, !!date && styles.activeTab]}
              onPress={() => {
                if (!date) onDateChange(new Date());
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  !!date && { color: activeColor, fontWeight: "600" },
                ]}
              >
                By Date
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !date && styles.activeTab]}
              onPress={() => onDateChange(null)}
            >
              <Text
                style={[
                  styles.tabText,
                  !date && { color: activeColor, fontWeight: "600" },
                ]}
              >
                All Dates
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Date Navigation Controls (Only show if date is selected) */}
        {date && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity onPress={handlePrevDay} style={styles.navButton}>
              <Ionicons name="chevron-back" size={24} color={activeColor} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateSelector} onPress={toggleOpen}>
              <Ionicons
                name="calendar"
                size={20}
                color={activeColor}
                style={styles.calendarIcon}
              />
              <Text style={[styles.dateText, { color: activeColor }]}>
                {dayjs(date).format("ddd, MMM D, YYYY")}
              </Text>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color="#666"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNextDay} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={24} color={activeColor} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Expanded Calendar */}
      {isOpen && date && (
        <View style={styles.calendarContainer}>
          <View style={styles.yearNavigation}>
            <TouchableOpacity
              onPress={() => changeYear(-1)}
              style={styles.yearButton}
            >
              <Ionicons
                name="play-back-outline"
                size={20}
                color={activeColor}
              />
              <Text style={[styles.yearButtonText, { color: activeColor }]}>
                Prev Year
              </Text>
            </TouchableOpacity>
            <Text style={styles.currentYearText}>
              {dayjs(currentMonth).format("YYYY")}
            </Text>
            <TouchableOpacity
              onPress={() => changeYear(1)}
              style={styles.yearButton}
            >
              <Text style={[styles.yearButtonText, { color: activeColor }]}>
                Next Year
              </Text>
              <Ionicons
                name="play-forward-outline"
                size={20}
                color={activeColor}
              />
            </TouchableOpacity>
          </View>

          <Calendar
            current={currentMonth}
            key={currentMonth}
            onDayPress={handleDateSelect}
            onMonthChange={(month: DateData) => {
              setCurrentMonth(month.dateString);
            }}
            markedDates={markedDates}
            minDate={minDate ? formatDate(minDate) : undefined}
            maxDate={maxDate ? formatDate(maxDate) : undefined}
            theme={{
              selectedDayBackgroundColor: activeColor,
              todayTextColor: activeColor,
              arrowColor: activeColor,
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
    fontWeight: "600",
    marginRight: 8,
  },
  calendarContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingBottom: 10,
  },
  yearNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  yearButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  yearButtonText: {
    fontWeight: "600",
    marginHorizontal: 4,
  },
  currentYearText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

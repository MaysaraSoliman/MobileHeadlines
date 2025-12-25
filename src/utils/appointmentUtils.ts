import { AppointmentStatus } from "../types/types";

/**
 * Maps AppointmentStatus enum values to hex color codes.
 * Ensures consistent UI colors across the application.
 */
export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  OPEN: "#3498db", // Blue
  PENDING: "#f39c12", // Orange
  CONFIRMED: "#2ecc71", // Green
  CHECKEDIN: "#1abc9c", // Teal
  INPROGRESS: "#9b59b6", // Purple
  COMPLETED: "#27ae60", // Dark Green
  CANCELED: "#e74c3c", // Red
  NOSHOW: "#c0392b", // Dark Red
  DELAYED: "#e67e22", // Dark Orange
};

/**
 * Returns the color associated with an appointment status.
 * Falls back to gray if status is unknown.
 *
 * @param status - The appointment status string
 * @returns Hex color string
 */
export const getStatusColor = (status: string | undefined | null): string => {
  if (!status) return "#95a5a6"; // Default Gray
  const color = STATUS_COLORS[status as AppointmentStatus];
  return color || "#95a5a6";
};

/**
 * Ordered list of status options for UI selectors (Dropdowns, Modals).
 * Can be reordered to change display order in the app.
 */
export const APPOINTMENT_STATUS_OPTIONS: AppointmentStatus[] = [
  "OPEN",
  "PENDING",
  "CONFIRMED",
  "CHECKEDIN",
  "INPROGRESS",
  "COMPLETED",
  "DELAYED",
  "CANCELED",
  "NOSHOW",
];

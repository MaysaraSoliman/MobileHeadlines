/**
 * Maps TaskPriority enum values to hex color codes.
 */
export const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#f44336", // Red
  HIGH: "#ff5722", // Deep Orange
  MEDIUM: "#ff9800", // Orange
  LOW: "#4caf50", // Green
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "#4caf50",
  DONE: "#4caf50",
  PENDING: "#ff9800",
  CANCELLED: "#f44336",
  CANCELED: "#f44336",
  IN_PROGRESS: "#2196f3",
};

/**
 * Returns the color associated with a task status.
 */
export const getTaskStatusColor = (
  status: string | undefined | null
): string => {
  if (!status) return "#999999";
  const color = TASK_STATUS_COLORS[status];
  return color || "#999999";
};

/**
 * Returns the color associated with a task priority.
 * Falls back to gray if priority is unknown.
 *
 * @param priority - The task priority string
 * @returns Hex color string
 */
export const getPriorityColor = (
  priority: string | undefined | null
): string => {
  if (!priority) return "#999999";
  const color = PRIORITY_COLORS[priority];
  return color || "#999999";
};

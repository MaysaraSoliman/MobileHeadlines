import { Fontisto, Ionicons } from "@expo/vector-icons";

const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="home" size={size} color={color} />
);

const FavoritesIcon = ({ color, size }: { color: string; size: number }) => (
  <Fontisto name="favorite" size={size} color={color} />
);

const SettingsIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="settings" size={size} color={color} />
);

export { HomeIcon, FavoritesIcon, SettingsIcon };

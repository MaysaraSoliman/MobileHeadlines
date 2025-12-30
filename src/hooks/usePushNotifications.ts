import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useMutation } from "@apollo/client";
import { REGISTER_PUSH_TOKEN } from "../graphql/mutations/mutations";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();
  const notificationListener = useRef<{ remove: () => void } | undefined>(
    undefined
  );
  const responseListener = useRef<{ remove: () => void } | undefined>(
    undefined
  );

  // Use a ref to track if we've already registered to avoid double calls in strict mode
  const isRegistered = useRef(false);

  const [registerPushToken] = useMutation(REGISTER_PUSH_TOKEN);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;

        if (!projectId) {
          console.log(
            "⚠️ No Project ID found. Notifications may fail in development without 'eas init'."
          );
        }

        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log("📱 Expo Push Token:", token);
      } catch (e) {
        console.error("Error getting push token:", e);
      }
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return token;
  }

  useEffect(() => {
    if (isRegistered.current) return;
    isRegistered.current = true;

    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      if (token) {
        registerPushToken({ variables: { token } }).catch((err) => {
          console.error("Failed to sync push token with backend:", err);
        });
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Response:", response);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};

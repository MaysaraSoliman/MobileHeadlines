import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(
    undefined
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const [notificationResponse, setNotificationResponse] = useState<
    Notifications.NotificationResponse | undefined
  >(undefined);
  const notificationListener =
    useRef<Notifications.EventSubscription>(undefined);
  const responseListener = useRef<Notifications.EventSubscription>(undefined);

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
        alert("Failed to get push token for push notification!");
        return;
      }

      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;

        if (projectId) {
          token = (
            await Notifications.getExpoPushTokenAsync({
              projectId,
            })
          ).data;
        } else {
          // Fallback for Expo Go dev mode without EAS config
          // If this fails, it means we need a projectId explicitly
          try {
            token = (await Notifications.getExpoPushTokenAsync()).data;
          } catch (err) {
            console.warn(
              "Failed to get push token without projectId. If you are in Expo Go, you may need to log in or provide a projectId in app.json."
            );
            return;
          }
        }

        console.log("Expo Push Token:", token);
      } catch (e) {
        console.error("Error getting push token:", e);
      }
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        setNotificationResponse(response);
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

  async function scheduleLocalNotification(
    title: string,
    body: string,
    data?: any
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // show immediately
    });
  }

  return {
    expoPushToken,
    notification,
    notificationResponse,
    registerForPushNotificationsAsync,
    scheduleLocalNotification,
  };
};

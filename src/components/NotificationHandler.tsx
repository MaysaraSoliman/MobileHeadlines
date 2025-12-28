import React, { useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { useAuth } from "../context/AuthContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { SAVE_EXPO_PUSH_TOKEN } from "../graphql/mutations/mutations";
import ScreenNames from "../navigation/ScreenNames";

export const NotificationHandler = ({
  navigationRef,
}: {
  navigationRef: any;
}) => {
  const { user } = useAuth();
  const { registerForPushNotificationsAsync, notificationResponse } =
    usePushNotifications();
  const [saveToken] = useMutation(SAVE_EXPO_PUSH_TOKEN);

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          saveToken({ variables: { token } }).catch((err) => {
            console.error("Failed to save push token to backend:", err);
          });
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (
      notificationResponse?.actionIdentifier ===
      "expo.modules.notifications.actions.DEFAULT"
    ) {
      const data = notificationResponse.notification.request.content.data;
      if (data?.taskId && navigationRef.isReady()) {
        navigationRef.navigate(ScreenNames.TaskDetailsScreen, {
          taskId: data.taskId,
        });
      }
    }
  }, [notificationResponse, navigationRef]);

  return null;
};

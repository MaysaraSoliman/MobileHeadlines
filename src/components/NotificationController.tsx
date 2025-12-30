import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export const NotificationController = () => {
  usePushNotifications();
  return null;
};

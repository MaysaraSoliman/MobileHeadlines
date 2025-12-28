const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
  // Check if token is valid (starts with ExponentPushToken or ExpoPushToken)
  if (!expoPushToken || !expoPushToken.match(/^Ex(ponent|po)PushToken/)) {
    console.warn(`Invalid Expo Push Token: ${expoPushToken}`);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    // Check for API errors
    if (result.errors) {
        console.error('Expo Push Notification API Error:', result.errors);
    }
    
    // Check for delivery errors in data
    if (result.data && result.data.status === 'error') {
        console.error('Expo Push Notification Delivery Error:', result.data);
    }

  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

module.exports = { sendPushNotification };

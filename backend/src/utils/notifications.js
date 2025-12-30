const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken) {
    console.log("⚠️ No push token provided for notification");
    return;
  }

  // Check if token is a valid Expo push token
  if (!pushToken.startsWith('ExponentPushToken[') && !pushToken.startsWith('ExpoPushToken[')) {
    console.log(`⚠️ Invalid Expo push token: ${pushToken}`);
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    console.log(`🚀 Sending push notification to ${pushToken}`);
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
    if (result.errors) {
      console.error('❌ Expo Push Error:', result.errors);
    } else {
      console.log('✅ Notification sent successfully');
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
};

module.exports = { sendPushNotification };

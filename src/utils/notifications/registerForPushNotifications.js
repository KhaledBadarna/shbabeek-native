import React from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  try {
    // Request permission for push notifications
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.warn("❌ Push permission not granted");
      return;
    }

    // Get the Expo push token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "802e361c-3d19-463a-9dd3-010711e886da",
    });
    console.log("📱 Expo Push Token:", token.data);

    // Handle notifications in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      // This is where you can handle received notifications when app is in the foreground
      console.log("🔔 Notification received in foreground:", notification);
    });

    // Handle user tapping on a notification
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("🔔 Notification response:", response);
    });

    return token.data; // Return the Expo push token
  } catch (err) {
    console.error("🚨 Error registering for push notifications:", err);
  }
}

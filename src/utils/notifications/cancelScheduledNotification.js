import * as Notifications from "expo-notifications";

export const cancelScheduledNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log("✅ Notification cancelled:", notificationId);
  } catch (error) {
    console.error("❌ Error cancelling notification:", error);
  }
};

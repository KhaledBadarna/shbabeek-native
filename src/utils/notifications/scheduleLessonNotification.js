// src/utils/scheduleLessonNotification.js
import * as Notifications from "expo-notifications";

export const scheduleLessonNotification = async (
  pushToken,
  selectedDate,
  startTime,
  title,
  body
) => {
  try {
    const appointmentStart = new Date(`${selectedDate}T${startTime}:00`);
    const triggerTimestamp = appointmentStart.getTime() - 10 * 60 * 1000; // 10 min before

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "default",
        badge: 1,
      },
      trigger: {
        type: "timestamp",
        timestamp: triggerTimestamp,
      },
    });

    console.log(
      "✅ Local Notification Scheduled for:",
      new Date(triggerTimestamp)
    );
  } catch (error) {
    console.error("❌ Failed to schedule notification:", error);
  }
};

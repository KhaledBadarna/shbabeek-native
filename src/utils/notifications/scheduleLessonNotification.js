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
    const lessonStart = new Date(`${selectedDate}T${startTime}:00`);
    const notificationTime = new Date(lessonStart.getTime() - 10 * 60 * 1000); // 10 min before

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "default", // ✅ play default sound
        badge: 1, // ✅ show badge
      },
      trigger: notificationTime,
      to: pushToken, // ✅ send to specific token if needed (optional for local)
    });

    console.log("✅ Local Notification Scheduled for:", notificationTime);
  } catch (error) {
    console.error("❌ Failed to schedule notification:", error);
  }
};

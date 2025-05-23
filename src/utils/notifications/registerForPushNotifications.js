import * as Notifications from "expo-notifications";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getApp } from "firebase/app";

// Get Firestore instance
const firestore = getFirestore(getApp());

export async function registerForPushNotificationsAsync(userId, userType) {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Notification permissions not granted");
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("📱 Expo Push Token:", token);

    if (!userId || !userType) {
      console.log("🚨 Missing userId or userType — not saving token");
      return;
    }

    const collectionName = userType === "barber" ? "barbers" : "clients";
    const userRef = doc(firestore, collectionName, userId);
    await updateDoc(userRef, { pushToken: token });

    console.log("✅ Token saved to Firestore");
  } catch (err) {
    console.error("❌ Failed to register push notifications:", err);
  }
}

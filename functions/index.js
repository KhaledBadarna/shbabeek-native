const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

// 🚀 Send lesson notification to teacher
exports.sendPushNotification = onDocumentCreated(
  "lessons/{lessonId}",
  async (event) => {
    const data = event.data.data();
    const teacherId = data.teacherId;

    const teacherDoc = await admin
      .firestore()
      .collection("teachers")
      .doc(teacherId)
      .get();

    const teacherData = teacherDoc.data();
    const pushToken = teacherData && teacherData.pushToken;

    if (!pushToken) return console.log("❌ No token for teacher");

    const message = {
      token: pushToken,
      notification: {
        title: "📚 Lesson Booked",
        body: "You've got a new lesson!",
      },
    };

    await admin.messaging().send(message);
    console.log("✅ Push sent!");
  }
);

// 💬 Send chat notification to other user
exports.sendChatNotification = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    const messageData = event.data.data();
    const chatId = event.params.chatId;
    const [teacherId, studentId] = chatId.split("_");
    const senderId = messageData.senderId;
    const recipientId = senderId === teacherId ? studentId : teacherId;

    let userDoc = await admin
      .firestore()
      .collection("teachers")
      .doc(recipientId)
      .get();

    if (!userDoc.exists) {
      userDoc = await admin
        .firestore()
        .collection("students")
        .doc(recipientId)
        .get();
    }

    const userData = userDoc.data();
    const pushToken = userData && userData.pushToken;

    if (!pushToken) return console.log("❌ No token for user");

    const message = {
      token: pushToken,
      notification: {
        title: "💬 New Chat Message",
        body: messageData.text || "You have a new message",
      },
    };

    await admin.messaging().send(message);
    console.log("✅ Chat push sent!");
  }
);

// 🕐 Scheduled function to reset old booked slots
exports.resetOldSlots = onSchedule("every day 00:00", async (event) => {
  const teachersSnap = await admin
    .firestore()
    .collection("teacher_availability")
    .get();

  const now = new Date();

  for (const doc of teachersSnap.docs) {
    const data = doc.data();
    const slots = data && data.slots ? data.slots : {};

    const updatedSlots = {};

    for (const [dayName, slotArray] of Object.entries(slots)) {
      updatedSlots[dayName] = slotArray.map((slot) => {
        const dateField = slot.date;
        const endTime = slot.endTime;
        const isBooked = slot.isBooked;

        if (!dateField || !endTime || !isBooked) return slot;

        const slotEndDate = new Date(`${dateField}T${endTime}:00`);
        if (slotEndDate < now) {
          return { ...slot, isBooked: false };
        }

        return slot;
      });
    }

    await doc.ref.update({ slots: updatedSlots });
  }

  console.log("✅ Reset old slots completed.");
});

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const { onSchedule } = require("firebase-functions/v2/scheduler");

admin.initializeApp();

// 🚀 Lesson Push
exports.sendPushNotification = functions.firestore
  .document("lessons/{lessonId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    const teacherId = data.teacherId;
    const doc = await admin
      .firestore()
      .collection("teachers")
      .doc(teacherId)
      .get();
    const docData = doc.data();
    const pushToken = docData && docData.pushToken;
    if (!pushToken) return;
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: pushToken,
        title: "📚 درس جديد",
        body: "تم حجز درس جديد لك!",
        sound: "default",
      }),
    });
    console.log("✅ Push sent to teacher");
  });

// 💬 Chat Push
exports.sendChatNotification = functions.firestore
  .document("chats/{chatId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const [teacherId, studentId] = context.params.chatId.split("_");
    const recipientId = data.senderId === teacherId ? studentId : teacherId;
    let doc = await admin
      .firestore()
      .collection("teachers")
      .doc(recipientId)
      .get();
    if (!doc.exists) {
      doc = await admin
        .firestore()
        .collection("students")
        .doc(recipientId)
        .get();
    }
    const docData = doc.data();
    const pushToken = docData && docData.pushToken;
    if (!pushToken) return;
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: pushToken,
        title: "💬 رسالة جديدة",
        body: data.text || "لديك رسالة جديدة",
        sound: "default",
      }),
    });
    console.log("✅ Chat push sent");
  });

// 🕐 Reset (keep Gen 2)
exports.resetOldSlots = onSchedule("every day 00:00", async () => {
  const snap = await admin.firestore().collection("teacher_availability").get();
  const now = new Date();
  for (const doc of snap.docs) {
    const docData = doc.data();
    const slots = (docData && docData.slots) || {};
    const updated = {};
    for (const [day, arr] of Object.entries(slots)) {
      updated[day] = arr.map((slot) => {
        const end = new Date(`${slot.date}T${slot.endTime}:00`);
        return end < now ? { ...slot, isBooked: false } : slot;
      });
    }
    await doc.ref.update({ slots: updated });
  }
  console.log("✅ Reset old slots");
});

// ✅ Tranzila Payment Cloud Function
exports.createPayment = functions.https.onCall(async (data, context) => {
  try {
    const { amount, cardToken, description, currency = "1" } = data; // currency 1 = Israeli Shekel (NIS)

    if (!amount || !cardToken || !description) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing payment parameters."
      );
    }

    const formData = new URLSearchParams();
    formData.append("supplier", "YOUR_SUPPLIER_ID");
    if ("YOUR_TERMINAL_PASSWORD") {
      formData.append("TranzilaPW", "YOUR_TERMINAL_PASSWORD");
    }
    formData.append("sum", amount.toString());
    formData.append("currency", currency);
    formData.append("TranzilaTK", cardToken); // tokenized card
    formData.append("description", description);

    const response = await fetch(
      "https://secure5.tranzila.com/cgi-bin/tranzila31u.cgi",
      {
        method: "POST",
        body: formData,
      }
    );

    const textResponse = await response.text();

    if (textResponse.includes("Response=000")) {
      return { success: true, message: "Payment completed successfully." };
    } else {
      return { success: false, message: "Payment failed.", raw: textResponse };
    }
  } catch (error) {
    console.error("❌ Payment error:", error);
    throw new functions.https.HttpsError("internal", "Payment failed.");
  }
});

const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

// 🚀 Appointment Push Notification (Barber)
exports.sendPushNotification = onDocumentCreated(
    {document: "appointments/{appointmentId}", region: "us-central1"},
    async (event) => {
      const data = event.data && event.data.data();
      if (!data) {
        console.warn("No data in event. Skipping.");
        return;
      }

      const barberId = data.barberId;

      const doc = await admin
          .firestore()
          .collection("barbers")
          .doc(barberId)
          .get();
      const docData = doc.data();
      const pushToken = docData && docData.pushToken;
      if (!pushToken) return;

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          to: pushToken,
          title: "📅 حجز جديد",
          body: "لديك حجز جديد!",
          sound: "default",
        }),
      });

      console.log("✅ Push sent to barber");
    },
);

// 🕐 Daily Reset of Booked Slots (Barber Availability)
exports.resetOldSlots = onSchedule(
    {schedule: "every day 00:00", region: "us-central1"},
    async () => {
      const snap = await admin
          .firestore()
          .collection("barber_availability")
          .get();
      const now = new Date();

      for (const doc of snap.docs) {
        const docData = doc.data();
        const slots = docData && docData.slots ? docData.slots : {};
        const updated = {};

        for (const [day, arr] of Object.entries(slots)) {
          updated[day] = arr.map((slot) => {
            const end = new Date(`${slot.date}T${slot.endTime}:00`);
            return end < now ? {...slot, isBooked: false} : slot;
          });
        }

        await doc.ref.update({slots: updated});
      }

      console.log("✅ Reset old slots");
    },
);

// ✅ Tranzila Payment Processing (ApplePay, Visa, GooglePay)
exports.createPayment = onCall({region: "us-central1"}, async (request) => {
  try {
    const {amount, cardToken, description} = request.data;

    if (!amount || !cardToken || !description) {
      throw new HttpsError("invalid-argument", "Missing payment parameters.");
    }

    // Simulated payment
    if (cardToken.startsWith("FAKE")) {
      console.log("⚠️ Simulated payment with FAKE token:", cardToken);
      return {success: true, message: "Simulated payment success (test)."};
    }

    // Real Tranzila request
    const formData = new URLSearchParams();
    formData.append("supplier", "fxpshbabeektok");
    formData.append("TranzilaPW", "B2tnFuI0");
    formData.append("sum", amount.toString());
    formData.append("currency", "1");
    formData.append("TranzilaTK", cardToken);
    formData.append("description", description);

    const response = await fetch(
        "https://secure5.tranzila.com/cgi-bin/tranzila31u.cgi",
        {
          method: "POST",
          headers: {"Content-Type": "application/x-www-form-urlencoded"},
          body: formData.toString(),
        },
    );

    const text = await response.text();
    console.log("📦 Tranzila response:", text);

    if (text.includes("Response=000")) {
      return {success: true, message: "Payment completed successfully."};
    } else {
      return {success: false, message: "Payment failed.", raw: text};
    }
  } catch (error) {
    console.error("❌ Payment error:", error);
    throw new HttpsError("internal", "Payment failed.");
  }
});

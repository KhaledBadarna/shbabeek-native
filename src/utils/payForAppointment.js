import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase"; // initialized Firebase Functions
import { getDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase";

const payForAppointment = async (clientId, appointmentId, amount) => {
  try {
    if (!clientId || !appointmentId || !amount) {
      throw new Error("Missing parameters");
    }

    const clientRef = doc(firestore, "clients", clientId);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) {
      throw new Error("Client not found");
    }

    const { defaultPaymentMethod, cardToken } = clientSnap.data();

    if (!defaultPaymentMethod) {
      throw new Error("No payment method saved");
    }

    const createPayment = httpsCallable(functions, "createPayment");

    if (defaultPaymentMethod === "Visa") {
      if (!cardToken) {
        throw new Error("No saved Visa card token");
      }

      const response = await createPayment({
        amount,
        cardToken,
        description: `💈 دفع لحجز موعد رقم ${appointmentId}`,
      });

      const { data } = response;
      if (data.success) {
        console.log("✅ Visa payment successful");
        return true;
      } else {
        console.error("❌ Visa payment failed:", data.message);
        return false;
      }
    }

    if (defaultPaymentMethod === "ApplePay") {
      if (!cardToken) {
        throw new Error("No saved Apple Pay token");
      }

      const response = await createPayment({
        amount,
        cardToken,
        description: `🍎 Apple Pay - حجز موعد رقم ${appointmentId}`,
      });

      const { data } = response;
      if (data.success) {
        console.log("✅ Apple Pay payment successful");
        return true;
      } else {
        console.error("❌ Apple Pay payment failed:", data.message);
        return false;
      }
    }

    if (defaultPaymentMethod === "GooglePay") {
      if (!cardToken) {
        throw new Error("No saved Google Pay token");
      }

      const response = await createPayment({
        amount,
        cardToken,
        description: `🤖 Google Pay - حجز موعد رقم ${appointmentId}`,
      });

      const { data } = response;
      if (data.success) {
        console.log("✅ Google Pay payment successful");
        return true;
      } else {
        console.error("❌ Google Pay payment failed:", data.message);
        return false;
      }
    }

    throw new Error("Unsupported payment method");
  } catch (error) {
    console.error("❌ payForAppointment error:", error);
    return false;
  }
};

export default payForAppointment;

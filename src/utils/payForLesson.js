import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase"; // your initialized functions
import { getDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase";

const payForLesson = async (userId, lessonId, amount) => {
  try {
    if (!userId || !lessonId || !amount) {
      throw new Error("Missing parameters");
    }

    const userRef = doc(firestore, "students", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const { defaultPaymentMethod, cardToken } = userSnap.data();

    if (!defaultPaymentMethod) {
      throw new Error("No payment method saved");
    }

    if (defaultPaymentMethod === "Visa") {
      if (!cardToken) {
        throw new Error("No saved Visa card token");
      }

      const createPayment = httpsCallable(functions, "createPayment");
      const paymentResponse = await createPayment({
        amount,
        cardToken,
        description: `دفع لحجز الدرس رقم ${lessonId}`,
      });

      const { data } = paymentResponse;
      if (data.success) {
        console.log("✅ Payment successful");
        return true;
      } else {
        console.error("❌ Payment failed:", data.message);
        return false;
      }
    }

    if (defaultPaymentMethod === "ApplePay") {
      // ⚡ Later: open Apple Pay native flow
      console.log("ApplePay flow should start here.");
      return false;
    }

    if (defaultPaymentMethod === "GooglePay") {
      // ⚡ Later: open Google Pay native flow
      console.log("GooglePay flow should start here.");
      return false;
    }

    throw new Error("Unsupported payment method");
  } catch (error) {
    console.error("❌ payForLesson error:", error);
    return false;
  }
};

export default payForLesson;

// 📂 tranzilaPayment.js
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase"; // ✅ your firebase initialized functions

export const payWithTranzila = async ({ amount, cardToken, description }) => {
  try {
    const createPayment = httpsCallable(functions, "createPayment");

    const response = await createPayment({
      amount,
      cardToken,
      description,
    });

    if (response.data.success) {
      console.log("✅ Payment success:", response.data.message);
      return { success: true };
    } else {
      console.error("❌ Payment failed:", response.data.message);
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    console.error("❌ Payment error:", error);
    return { success: false, error: error.message };
  }
};

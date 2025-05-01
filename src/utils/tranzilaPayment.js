// 📂 tranzilaPayment.js
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase"; // ✅ your firebase initialized functions

// ✅ Function to Pay
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

// ✅ Function to Create Card Token
export const createCardToken = async (cardNumber, expMonth, expYear, cvv) => {
  try {
    const createToken = httpsCallable(functions, "createCardToken");
    const result = await createToken({ cardNumber, expMonth, expYear, cvv });

    if (result.data.success) {
      return result.data.token; // ✅ Success - return token
    } else {
      console.error("❌ Token creation failed:", result.data.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Error creating token:", error);
    return null;
  }
};

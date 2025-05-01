// ✅ UPDATED PaymentMethodModal.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  TextInput,
  Image,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { firestore, functions } from "../../firebase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { setUserInfo } from "../../redux/slices/userSlice";
import { httpsCallable } from "firebase/functions";

const PaymentMethodModal = ({ visible, setOpenPaymentMethod }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const userId = useSelector((state) => state.user.userId);
  const dispatch = useDispatch();

  const isIOS = Platform.OS === "ios";

  const tokenizeVisaCard = async (cardNumber, expiry, cvv) => {
    try {
      if (!cardNumber || !expiry || !cvv) throw new Error("Missing card data");
      const [expMonth, expYear] = expiry.split("/");

      console.log("📦 Sending to Cloud Function:", {
        cardNumber,
        expMonth,
        expYear,
        cvv,
      });

      const createToken = httpsCallable(functions, "createCardToken");
      const result = await createToken({
        cardNumber,
        expMonth,
        expYear,
        cvv,
      });

      console.log("🔍 Token result:", result?.data);

      if (result.data.success) {
        const token = result.data.token;
        const last4 = cardNumber.slice(-4);
        return { token, last4 };
      } else {
        throw new Error(result.data.message || "Tokenization failed");
      }
    } catch (error) {
      console.error("❌ Tokenization crash:", error);
      throw error; // re-throw to show alert above
    }
  };

  const handlePaymentSelection = (method) => {
    setSelectedMethod(method);
  };

  const savePaymentMethod = async () => {
    if (!userId) return alert("حدث خطأ. لا يوجد معرف المستخدم.");

    try {
      let updateData = { defaultPaymentMethod: selectedMethod };

      if (selectedMethod === "Visa") {
        const { token, last4 } = await tokenizeVisaCard(
          cardNumber,
          expiry,
          cvv
        );
        updateData.cardToken = token;
        updateData.last4 = last4;
      }

      if (selectedMethod === "ApplePay") {
        updateData.cardToken = `FAKE-APPLE-${Date.now()}`;
        updateData.last4 = "";
      }

      if (selectedMethod === "GooglePay") {
        updateData.cardToken = `FAKE-GOOGLE-${Date.now()}`;
        updateData.last4 = "ⓖⓖⓖⓖ";
      }
      await setDoc(doc(firestore, "students", userId), updateData, {
        merge: true,
      });
      dispatch(setUserInfo(updateData));
      alert("✅ تم حفظ طريقة الدفع بنجاح");

      setOpenPaymentMethod(false);
      setSelectedMethod(null);
      setCardNumber("");
      setExpiry("");
      setCvv("");
    } catch (err) {
      console.error("Error saving payment method:", err);
    }
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setOpenPaymentMethod(false);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.closeIcon} onPress={handleClose}>
            <Icon name="close-circle-outline" size={26} color="#031417" />
          </TouchableOpacity>

          <Text style={styles.title}>اختر طريقة الدفع</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedMethod === "Visa" && styles.selectedOption,
            ]}
            onPress={() => handlePaymentSelection("Visa")}
          >
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png",
              }}
              style={styles.paymentIcon}
            />
            <Text style={styles.paymentText}>Visa / MasterCard</Text>
          </TouchableOpacity>

          {isIOS && (
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedMethod === "ApplePay" && styles.selectedOption,
              ]}
              onPress={() => handlePaymentSelection("ApplePay")}
            >
              <Icon name="apple" size={30} />
              <Text style={styles.paymentText}>Apple Pay</Text>
            </TouchableOpacity>
          )}

          {!isIOS && (
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedMethod === "GooglePay" && styles.selectedOption,
              ]}
              onPress={() => handlePaymentSelection("GooglePay")}
            >
              <Icon name="google" size={30} color="#4285F4" />
              <Text style={styles.paymentText}>Google Pay</Text>
            </TouchableOpacity>
          )}

          {selectedMethod === "Visa" && (
            <View style={styles.cardForm}>
              <TextInput
                style={styles.input}
                placeholder="رقم البطاقة"
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={setCardNumber}
                maxLength={16}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 10 }]}
                  placeholder="MM/YY"
                  value={expiry}
                  onChangeText={setExpiry}
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  maxLength={4}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: selectedMethod ? "#009dff" : "#ccc" },
            ]}
            disabled={!selectedMethod}
            onPress={savePaymentMethod}
          >
            <Text style={styles.saveButtonText}>حفظ طريقة الدفع</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ✅ Your styles same as before...

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: "90%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 40,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: "Cairo",
    textAlign: "center",
    marginBottom: 15,
    color: "#031417",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginVertical: 6,
  },
  selectedOption: {
    borderColor: "#009dff",
    backgroundColor: "#E7FAFC",
  },
  paymentIcon: {
    width: 40,
    height: 25,
    marginRight: 10,
  },
  paymentText: {
    fontSize: 16,
    fontFamily: "Cairo",
    color: "#031417",
  },
  cardForm: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontFamily: "Cairo",
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
  },
  saveButton: {
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo",
  },
});

export default PaymentMethodModal;

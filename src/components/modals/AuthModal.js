import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from "../../redux/slices/userSlice";
import { setTeacherData } from "../../redux/slices/teacherSlice";
import { setFavorites } from "../../redux/slices/favoritesSlice";
import { firestore } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { registerForPushNotificationsAsync } from "../../utils/notifications/registerForPushNotifications";
import fetchLessons from "../../utils/fetchLessons";
const AuthModal = ({ visible, onClose, mode = "auth", onConfirm }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState("register");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const phoneInputRef = useRef(null);
  const otpInputs = useRef([]);
  const { userId, userType } = useSelector((state) => state.user);

  useEffect(() => {
    if (visible) {
      setStep("register");
      setPhone("");
      setName("");
      setOtp(["", "", "", ""]);

      setTimeout(() => {
        if (phoneInputRef.current) phoneInputRef.current.focus();
      }, 300);
    }
  }, [visible]);

  useEffect(() => {
    if (step === "otp" && otpInputs.current[0]) {
      setTimeout(() => otpInputs.current[0].focus(), 300);
    }
  }, [step]);

  const toggleRole = () => {
    if (mode === "auth") {
      setRole((prevRole) => (prevRole === "student" ? "teacher" : "student"));
    }
  };

  const handlePhoneSubmit = () => {
    if (!phone.trim()) {
      alert("يرجى إدخال رقم الهاتف");
      return;
    }
    setStep("otp");
  };

  const confirmOtp = async () => {
    const cleanedPhone = phone.replace(/-/g, "");

    if (mode === "updatePhone") {
      if (onConfirm) onConfirm(cleanedPhone);
    }

    const code = otp.join("");

    if (code.length === 4) {
      let userRole = role || "student";
      const collectionName = userRole === "student" ? "students" : "teachers";
      let userIdToUse = userId;

      try {
        if (!userIdToUse) {
          const usersCollectionRef = collection(firestore, collectionName);
          const q = query(
            usersCollectionRef,
            where("phone", "==", cleanedPhone)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            userIdToUse = querySnapshot.docs[0].id;
          }
        }

        if (userIdToUse) {
          const userDocRef = doc(firestore, collectionName, userIdToUse);
          let userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            let existingUser = userSnapshot.data();

            // 🔧 Add missing default teacher fields if needed
            const updatedFields = {};
            if (userRole === "teacher") {
              if (existingUser.pendingPayout === undefined) {
                updatedFields.pendingPayout = 0;
              }
              if (existingUser.totalEarned === undefined) {
                updatedFields.totalEarned = 0;
              }
              if (!existingUser.bankDetails) {
                updatedFields.bankDetails = {
                  fullName: "",
                  bankNumber: "",
                  branchBank: "",
                  accountNumber: "",
                };
              }
            }

            // ✅ Merge only if there are updates
            if (Object.keys(updatedFields).length > 0) {
              await setDoc(userDocRef, updatedFields, { merge: true });

              // ⬅️ Re-fetch updated data
              userSnapshot = await getDoc(userDocRef);
              existingUser = userSnapshot.data();
            }

            // ✅ Store user data in Redux
            dispatch(
              setUserInfo({
                name: existingUser.name,
                phone: existingUser.phone,
                profileImage: existingUser.profileImage,
                userId: userIdToUse,
                defaultPaymentMethod: existingUser.defaultPaymentMethod || "", // ← Add this
                isLoggedIn: true,
                userType: userRole,
              })
            );

            if (userRole === "teacher") {
              dispatch(setTeacherData(existingUser));
            } else if (userRole === "student") {
              dispatch(setFavorites(existingUser.favorites));
            }

            // ✅ Fetch lessons for user
            await fetchLessons(userIdToUse, userRole, dispatch);
          }
        }
      } catch (error) {
        console.error("❌ Error logging in:", error);
      }

      // ✅ Second try block for push notifications
      try {
        if (userIdToUse && userRole) {
          await registerForPushNotificationsAsync(userIdToUse, userRole);
          console.log("✅ Push token registered");
        } else {
          console.log("❌ Missing userId or userRole for push registration");
        }

        onClose();
      } catch (error) {
        console.error("🚨 Error during push registration:", error);
      }
    }
  };

  const handleUpdateName = async () => {
    if (!name.trim()) {
      alert("يرجى إدخال اسم صحيح");
      return;
    }

    if (!userId) {
      console.error("🚨 Error: User ID is missing!");
      return;
    }

    try {
      const collectionName = userType === "teacher" ? "teachers" : "students";
      const userDocRef = doc(firestore, collectionName, userId); // ✅ Use stored ID

      await updateDoc(userDocRef, { name });

      dispatch(setUserInfo({ name: name })); // ✅ Updates only the name

      console.log("✅ Name updated successfully!");
      onClose();
    } catch (error) {
      console.error("❌ Error updating name:", error);
    }
  };
  // ✅ Function to format phone number & convert Arabic numbers
  const handlePhoneChange = (text) => {
    // ✅ Convert Arabic numbers (١٢٣٤٥...) to standard English numbers (12345)
    const arabicToEnglishMap = {
      "٠": "0",
      "١": "1",
      "٢": "2",
      "٣": "3",
      "٤": "4",
      "٥": "5",
      "٦": "6",
      "٧": "7",
      "٨": "8",
      "٩": "9",
    };
    text = text.replace(/[٠-٩]/g, (d) => arabicToEnglishMap[d] || d);

    // ✅ Remove any non-numeric characters
    let numericText = text.replace(/\D/g, "");

    // ✅ Ensure max length of 10 digits
    if (numericText.length > 10) {
      numericText = numericText.slice(0, 10);
    }

    // ✅ Apply formatting `054-XXXX-XXX`
    if (numericText.length >= 4) {
      numericText = `${numericText.slice(0, 3)}-${numericText.slice(3, 7)}${
        numericText.length > 7 ? "-" + numericText.slice(7) : ""
      }`;
    }

    setPhone(numericText);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          {mode === "updateName" || step === "updateName" ? (
            <>
              <Text style={styles.title}>تحديث الاسم</Text>
              <TextInput
                textAlign="right"
                placeholder="أدخل الاسم الجديد"
                style={styles.input}
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleUpdateName}
              >
                <Text style={styles.confirmButtonText}>تحديث</Text>
              </TouchableOpacity>
            </>
          ) : step === "register" ? (
            <>
              <Text style={styles.title}>
                {mode === "updatePhone" ? "تحديث رقم الهاتف" : "تسجيل الدخول"}
              </Text>
              <TextInput
                ref={phoneInputRef}
                textAlign="right"
                placeholder="رقم الهاتف"
                style={styles.input}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={handlePhoneChange} // ✅ Format input dynamically
              />
              {mode === "auth" && (
                <TouchableOpacity onPress={toggleRole}>
                  <Text style={styles.roleToggleText}>
                    {role === "student"
                      ? "اضغط للدخول كمعلم"
                      : "اضغط للدخول كطالب"}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handlePhoneSubmit}
              >
                <Text style={styles.confirmButtonText}>التالي</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>تأكيد رقم الهاتف</Text>
              <Text style={styles.subtitle}>
                أدخل رمز التحقق المرسل إلى {"\u200E"}
                {phone}
              </Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => (otpInputs.current[index] = el)}
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => {
                      const newOtp = [...otp];
                      newOtp[index] = text;
                      setOtp(newOtp);
                      if (text && index < 3)
                        otpInputs.current[index + 1]?.focus();
                    }}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmOtp}
              >
                <Text style={styles.confirmButtonText}>تأكيد</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ede9e9",
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 20,
    color: "#00e5ff",
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#031417",
    marginVertical: 10,
    fontFamily: "Cairo",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    fontFamily: "Cairo",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    fontSize: 17,
    fontFamily: "Cairo",
    width: "80%",
    paddingVertical: 10,
    textAlign: "left",
    paddingLeft: 10,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 10,
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Cairo",
    color: "#031417",
  },
  confirmButton: {
    backgroundColor: "#00e5ff",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginTop: 10,
  },
  confirmButtonText: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Cairo",
  },
  roleToggleText: {
    color: "#00e5ff",
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Cairo",
    marginTop: 10,
  },
});

export default AuthModal;

import React, { useState, useRef, useEffect } from "react";
import {
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
import NameImageModal from "../NameImageModal";
import { registerForPushNotificationsAsync } from "../../utils/notifications/registerForPushNotifications";
import fetchLessons from "../../utils/fetchLessons";
import Modal from "react-native-modal";
const AuthModal = ({ visible, onClose, mode = "auth", onConfirm }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState("register");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showNameImageModal, setShowNameImageModal] = useState(false);
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
    if (code.length !== 4) return;

    let userRole = role || "student";
    const collectionName = userRole === "student" ? "students" : "teachers";
    let userIdToUse = userId;
    let existingUser = null;

    try {
      if (!userIdToUse) {
        const usersCollectionRef = collection(firestore, collectionName);
        const q = query(usersCollectionRef, where("phone", "==", cleanedPhone));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          userIdToUse = querySnapshot.docs[0].id;
        } else {
          const userData = {
            name: "",
            phone: cleanedPhone,
            profileImage: "",
            createdAt: new Date().toISOString(),
            userType: userRole,
          };

          if (userRole === "teacher") {
            Object.assign(userData, {
              pendingPayout: 0,
              totalEarned: 0,
              pricePerHour: "",
              bio: "",
              bankDetails: {
                fullName: "",
                bankNumber: "",
                branchBank: "",
                accountNumber: "",
              },
              stages: [],
              topics: [],
              rating: 0,
              ratingCount: 0,
              lessonsCount: 0,
            });
          } else {
            userData.favorites = [];
          }

          const newUserDocRef = await addDoc(usersCollectionRef, userData);
          userIdToUse = newUserDocRef.id;
          userIdToUse = newUserDocRef.id;
        }
      }

      // Fetch user data
      if (userIdToUse) {
        const userDocRef = doc(firestore, collectionName, userIdToUse);
        let userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          existingUser = userSnapshot.data();

          // Add missing fields if needed
          const updates = {};
          if (userRole === "teacher") {
            if (existingUser.pendingPayout === undefined)
              updates.pendingPayout = 0;
            if (existingUser.totalEarned === undefined) updates.totalEarned = 0;
            if (!existingUser.bankDetails) {
              updates.bankDetails = {
                fullName: "",
                bankNumber: "",
                branchBank: "",
                accountNumber: "",
              };
            }
          }

          if (Object.keys(updates).length > 0) {
            await setDoc(userDocRef, updates, { merge: true });
            userSnapshot = await getDoc(userDocRef);
            existingUser = userSnapshot.data();
          }

          // Store user in Redux
          const formattedName = existingUser.name
            ? existingUser.name.split(" ")[0] +
              (existingUser.name.split(" ")[1]
                ? " " + existingUser.name.split(" ")[1][0] + "."
                : "")
            : "";

          dispatch(
            setUserInfo({
              name: formattedName,
              phone: existingUser.phone,
              profileImage: existingUser.profileImage,
              userId: userIdToUse,
              defaultPaymentMethod: existingUser.defaultPaymentMethod || "",
              isLoggedIn: true,
              userType: userRole,
            })
          );

          if (userRole === "teacher") {
            dispatch(setTeacherData(existingUser));
          } else {
            dispatch(setFavorites(existingUser.favorites));
          }

          await fetchLessons(userIdToUse, userRole, dispatch);
        }
      }

      // ✅ Show NameImageModal if required
      const needsNameImage =
        !existingUser?.name ||
        (userRole === "teacher" && !existingUser?.profileImage);

      if (needsNameImage) {
        setShowNameImageModal(true);
        return; // ⛔ Don't close AuthModal yet
      }

      // ✅ Everything ok, close modal
      await registerForPushNotificationsAsync(userIdToUse, userRole);
      onClose();
    } catch (error) {
      console.error("❌ Error in confirmOtp:", error);
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
      const formattedName = name
        ? name.split(" ")[0] +
          (name.split(" ")[1] ? " " + name.split(" ")[1][0] + "." : "")
        : "";
      dispatch(setUserInfo({ name: formattedName }));

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
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutUp"
      backdropColor="#000"
      backdropOpacity={0.5}
      useNativeDriver
    >
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
            <TouchableOpacity style={styles.confirmButton} onPress={confirmOtp}>
              <Text style={styles.confirmButtonText}>تأكيد</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <NameImageModal
        visible={showNameImageModal}
        onClose={() => {
          setShowNameImageModal(false);
          onClose(); // close auth modal too
        }}
      />
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalContent: {
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
    color: "#009dff",
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
    backgroundColor: "#009dff",
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
    color: "#009dff",
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Cairo",
    marginTop: 10,
  },
});

export default AuthModal;

// AuthModal.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from "../../redux/slices/userSlice";
import { setBarberData } from "../../redux/slices/barberSlice";
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
import fetchAppointments from "../../utils/fetchAppointments";
import Modal from "react-native-modal";
import InfoModal from "./InfoModal";
import { Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
const { height } = Dimensions.get("window");
const AuthModal = ({ visible, onClose, mode = "auth", onConfirm }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState("register");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showNameImageModal, setShowNameImageModal] = useState(false);
  const phoneInputRef = useRef(null);
  const otpInputs = useRef([]);
  const { userId, userType } = useSelector((state) => state.user);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoText, setInfoText] = useState("");
  useEffect(() => {
    const filled = otp.every((d) => d.length === 1);
    if (filled) {
      confirmOtp();
    }
  }, [otp]);
  useEffect(() => {
    if (visible) {
      setStep("register");
      setPhone("");
      setName("");
      setOtp(["", "", "", ""]);
      setTimeout(() => phoneInputRef.current?.focus(), 300);
    }
  }, [visible]);

  useEffect(() => {
    if (step === "otp") setTimeout(() => otpInputs.current[0]?.focus(), 300);
  }, [step]);

  const toggleRole = () => {
    if (mode === "auth")
      setRole((prevRole) => (prevRole === "client" ? "barber" : "client"));
  };

  const handlePhoneSubmit = () => {
    if (!phone.trim()) {
      setInfoText("يرجى إدخال رقم الهاتف");
      setInfoVisible(true);
      return;
    }
    setStep("otp");
  };

  const confirmOtp = async () => {
    const cleanedPhone = phone.replace(/-/g, "");
    const code = otp.join("");
    if (code.length !== 4) return;

    let userRole = role || "client";
    const collectionName = userRole === "client" ? "clients" : "barbers";
    let userIdToUse = userId;
    let existingUser = null;

    try {
      if (!userIdToUse) {
        const q = query(
          collection(firestore, collectionName),
          where("phone", "==", cleanedPhone)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          userIdToUse = snapshot.docs[0].id;
        } else {
          const userData = {
            name: "",
            phone: cleanedPhone,
            profileImage: "",
            createdAt: new Date().toISOString(),
            userType: userRole,
          };

          if (userRole === "barber") {
            Object.assign(userData, {
              pendingPayout: 0,
              totalEarned: 0,
              rating: 0,
              ratingCount: 0,
              profileImage: "",
              salonName: "",
              introVideo: null,
              isAvailable: false,
              location: "",
              bankDetails: {
                fullName: "",
                bankNumber: "",
                branchBank: "",
                accountNumber: "",
              },
              services: {
                hair: 0,
                beard: 0,
                both: 0,
                kids: 0,
              },
              createdAt: new Date().toISOString(),
            });
          } else {
            userData.favorites = [];
          }

          const newUserRef = await addDoc(
            collection(firestore, collectionName),
            userData
          );
          userIdToUse = newUserRef.id;
        }
      }

      const userDocRef = doc(firestore, collectionName, userIdToUse);
      let userSnapshot = await getDoc(userDocRef);
      existingUser = userSnapshot.data();

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

      await registerForPushNotificationsAsync(userIdToUse, userRole);

      if (userRole === "barber") {
        dispatch(setBarberData(existingUser));
      } else {
        dispatch(setFavorites(existingUser.favorites || []));
      }

      await fetchAppointments(userRole, userIdToUse, dispatch);

      const needsNameImage =
        !existingUser?.name ||
        (userRole === "barber" && !existingUser?.profileImage);
      if (needsNameImage) {
        setShowNameImageModal(true);
        return;
      }

      onClose();
    } catch (error) {
      console.error("❌ Error in confirmOtp:", error);
    }
  };

  const handlePhoneChange = (text) => {
    const map = {
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
    text = text.replace(/[٠-٩]/g, (d) => map[d] || d);
    let numericText = text.replace(/\D/g, "");
    if (numericText.length > 10) numericText = numericText.slice(0, 10);
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
      style={{ justifyContent: "flex-end", margin: 0 }} // 👈 bottom-aligned
    >
      <View style={styles.modalContent}>
        {step === "register" ? (
          <>
            <Text style={styles.title}>تسجيل الدخول</Text>
            <Text style={styles.subTitle}>
              استخدم رقم الهاتف للانضمام او لتسجيل الدخول{" "}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                ref={phoneInputRef}
                placeholder="رقم الهاتف"
                style={styles.input}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={handlePhoneChange}
              />
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={handlePhoneSubmit}
              >
                <Icon
                  name="login"
                  size={30}
                  color="#ffffff"
                  style={{ marginRight: 10 }}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={toggleRole}>
              <Text style={styles.roleToggleText}>
                {role === "client" ? "حلاق ؟ اضغط هنا" : "زبون ؟ اضغط هنا"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>تأكيد رقم الهاتف</Text>
            <Text style={styles.subTitle}>
              ادخل الرمز المكون من 4 أرقام الذي تم إرساله إلى{" "}
              <Text style={styles.phoneHighlight}>
                {`\u202A${phone}\u202C`}
              </Text>
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
                    if (text && index < 3) {
                      otpInputs.current[index + 1]?.focus();
                    }
                  }}
                />
              ))}
            </View>
          </>
        )}
      </View>
      <NameImageModal
        visible={showNameImageModal}
        onClose={() => {
          setShowNameImageModal(false);
          onClose();
        }}
      />
      <InfoModal
        isVisible={infoVisible}
        onClose={() => setInfoVisible(false)}
        message={infoText}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: height * 0.6, // 👈 50% of screen
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#031417",
    marginTop: 10,
    fontFamily: "Cairo",
    textAlign: "right",
  },
  subTitle: {
    fontSize: 12,
    color: "#747474",
    marginBottom: 10,
    fontFamily: "Cairo",
    textAlign: "right",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    fontSize: 17,
    fontFamily: "Cairo",
    paddingVertical: 10,
    paddingHorizontal: 12,
    textAlign: "right",
    marginLeft: 10,
  },
  inputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    marginBottom: 5,
  },
  arrowButton: {
    backgroundColor: "#009dff",
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Cairo",
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
    fontSize: 13,
    textAlign: "right",
    fontFamily: "Cairo",
  },
  phoneHighlight: {
    color: "#009dff",
    fontWeight: "bold",
  },
});

export default AuthModal;

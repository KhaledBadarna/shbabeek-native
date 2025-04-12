import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/slices/userSlice"; // Store phone & role in Redux
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const RegisterModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const [role, setRole] = useState("student");
  const [phone, setPhone] = useState("");

  // ✅ Function to format phone number as `054-XXXX-XXX`
  const handlePhoneChange = (text) => {
    // Remove any non-numeric characters
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

  const handlePhoneSubmit = () => {
    if (phone.length !== 12) {
      alert("يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام");
      return;
    }

    dispatch(setUserInfo({ phone, userType: role }));
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={onClose} style={styles.topCloseButton}>
            <Text style={styles.topCloseButtonText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.title}>تسجيل الدخول</Text>
          <View style={styles.inputContainer}>
            <TextInput
              textAlign="right"
              placeholder="رقم الهاتف"
              style={styles.input}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={handlePhoneChange} // ✅ Format input dynamically
            />
            <Icon
              style={{ marginLeft: 5 }}
              name="arrow-left-bold-box"
              size={60}
              color="#0eabe4"
              onPress={handlePhoneSubmit}
            />
          </View>

          <Text
            onPress={() => setRole(role === "student" ? "teacher" : "student")}
            style={styles.teacherButtonText}
          >
            {role === "student" ? "استاذ ؟ اضغط هنا !" : "طالب ؟ اضغط هنا !"}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: height * 0.7,
  },
  topCloseButton: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#ede9e9",
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  topCloseButtonText: {
    fontSize: 20,
    color: "#00adf0",
    fontWeight: "semibold",
  },
  title: {
    fontSize: 20,
    fontWeight: "semibold",
    marginBottom: 30,
    textAlign: "center",
    fontFamily: "Cairo",
    marginTop: 30,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    fontSize: 17,
    fontFamily: "Cairo",
    marginLeft: 10,
    width: "80%",
    paddingVertical: 10,
    textAlign: "left",
    paddingLeft: 10,
  },
  teacherButtonText: {
    color: "#0eabe4",
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Cairo",
    textAlign: "right",
  },
});

export default RegisterModal;

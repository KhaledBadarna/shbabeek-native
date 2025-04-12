import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { setUserInfo } from "../redux/slices/userSlice"; // Redux action
import { useDispatch, useSelector } from "react-redux";
import { firestore } from "../firebase"; // Firestore import
import { doc, updateDoc, getDoc } from "firebase/firestore";

const EditStudentProfileModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user); // Get user data from Redux
  const [newName, setNewName] = useState(user.name || "");
  const [newPhone, setNewPhone] = useState(user.phone || "");
  console.log(user);

  const handleSave = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert("خطأ", "يجب ملء جميع الحقول");
      return;
    }

    try {
      const collectionName =
        user.userType === "student" ? "students" : "teachers";
      const userRef = doc(firestore, collectionName, user.userId);

      // ✅ Update Firestore (name & phone)
      await updateDoc(userRef, {
        name: newName,
        phone: newPhone,
      });

      // ✅ Fetch updated user data after saving
      const updatedUserSnap = await getDoc(userRef);
      if (updatedUserSnap.exists()) {
        const updatedUserData = updatedUserSnap.data(); // ✅ Correctly fetch user data

        // ✅ Update Redux with ALL user info (keeping profileImage)
        dispatch(
          setUserInfo({
            name: updatedUserData.name || user.name, // Fallback to old value if undefined
            phone: updatedUserData.phone || user.phone,
            profileImage: updatedUserData.profileImage || user.profileImage, // 🔥 Keep profile image
            userId: user.userId, // Ensure userId is kept
            userType: user.userType, // Keep user type
          })
        );
      } else {
        console.warn("🔴 User document not found in Firestore");
      }

      Alert.alert("تم التحديث", "تم تحديث معلوماتك بنجاح!");
      onClose(); // Close modal after saving
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء تحديث المعلومات");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>تعديل المعلومات الشخصية</Text>
          <TextInput
            style={styles.input}
            value={newName}
            placeholder="اسم المستخدم"
            onChangeText={setNewName}
          />
          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف"
            keyboardType="phone-pad"
            value={newPhone}
            onChangeText={setNewPhone}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>حفظ</Text>
            </TouchableOpacity>
          </View>
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
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#00adf0",
    fontFamily: "Cairo",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    textAlign: "right",
    fontFamily: "Cairo",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontFamily: "Cairo",
  },
  saveButton: {
    backgroundColor: "#00adf0",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo",
  },
});

export default EditStudentProfileModal;

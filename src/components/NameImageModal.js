import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSelector, useDispatch } from "react-redux";
import { firestore } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { setUserInfo } from "../redux/slices/userSlice";
import { setTeacherData } from "../redux/slices/teacherSlice";

const NameImageModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { userId, userType: role } = useSelector((state) => state.user); // student | teacher

  const [name, setName] = useState("");
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    if (!visible) {
      setName("");
      setImageUri(null);
    }
  }, [visible]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("يجب السماح بالوصول إلى الصور");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("خطأ", "يرجى إدخال الاسم");
      return;
    }

    if (role === "teacher" && !imageUri) {
      Alert.alert("خطأ", "يرجى اختيار صورة للملف الشخصي (إجباري للمعلمين)");
      return;
    }

    try {
      const collectionName = role === "teacher" ? "teachers" : "students";
      const userRef = doc(firestore, collectionName, userId);

      const data = { name };
      if (role === "teacher" && imageUri) {
        data.profileImage = imageUri;
      }

      await updateDoc(userRef, data);

      // ✅ Dispatch both name and profileImage to Redux
      dispatch(
        setUserInfo({
          name,
          profileImage: imageUri || "", // ensure this field is set
        })
      );

      if (role === "teacher") {
        const updatedDoc = await getDoc(userRef);
        dispatch(setTeacherData(updatedDoc.data()));
      }

      onClose();
    } catch (error) {
      console.error("❌ Error saving name/image:", error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>أدخل معلوماتك</Text>

          <TextInput
            style={styles.input}
            placeholder="الاسم الكامل"
            value={name}
            onChangeText={setName}
            textAlign="right"
          />

          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <Text style={styles.imageText}>اختر صورة (إجباري للمعلمين)</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>حفظ</Text>
          </TouchableOpacity>
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
  container: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontFamily: "Cairo",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#031417",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontFamily: "Cairo",
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageText: {
    fontSize: 12,
    color: "#888",
    fontFamily: "Cairo",
    textAlign: "center",
    padding: 5,
  },
  saveButton: {
    backgroundColor: "#00e5ff",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo",
  },
});

export default NameImageModal;

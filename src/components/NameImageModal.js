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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import InfoModal from "./modals/InfoModal";
import { useSelector, useDispatch } from "react-redux";
import { firestore } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { setUserInfo } from "../redux/slices/userSlice";
import { setTeacherData } from "../redux/slices/teacherSlice";

const NameImageModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { userId, userType: role } = useSelector((state) => state.user);
  const [name, setName] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoText, setInfoText] = useState("");
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
      quality: 0.5,
      base64: false,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  const uploadToCloudinary = async (uri) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: "profile.jpg",
      type: "image/jpeg",
    });
    formData.append("upload_preset", "profile_upload");
    formData.append("cloud_name", "dmewlyit3");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dmewlyit3/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };
  const handleSave = async () => {
    if (role === "student") {
      if (!name.trim()) {
        setInfoText("يرجى إدخال الاسم على الأقل للاستمرار!");
        setInfoVisible(true);
        return;
      } else if (/\d/.test(name.trim())) {
        setInfoText("❌ الاسم لا يمكن أن يحتوي على أرقام!");
        setInfoVisible(true);
        return;
      }
    }

    if (role === "teacher") {
      if (!name.trim() && !imageUri) {
        setInfoText("يرجى إدخال الاسم والصورة الشخصية للاستمرار!");
        setInfoVisible(true);
        return;
      } else if (!name.trim()) {
        setInfoText("يرجى إدخال الاسم للاستمرار!");
        setInfoVisible(true);
        return;
      } else if (/\d/.test(name.trim())) {
        setInfoText("❌ الاسم لا يمكن أن يحتوي على أرقام!");
        setInfoVisible(true);
        return;
      } else if (!imageUri) {
        setInfoText("يرجى تحميل صورة شخصية للاستمرار!");
        setInfoVisible(true);
        return;
      }
    }

    try {
      const collectionName = role === "teacher" ? "teachers" : "students";
      const userRef = doc(firestore, collectionName, userId);
      const data = { name }; // ✅ define it here

      if (imageUri) {
        const cloudUrl = await uploadToCloudinary(imageUri);
        data.profileImage = cloudUrl;
      }

      await updateDoc(userRef, data);

      const formatName = (fullName) => {
        const parts = fullName.trim().split(" ");
        return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[1][0]}.`;
      };

      dispatch(
        setUserInfo({
          name: formatName(name),
          profileImage: data.profileImage || "",
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
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>أدخل معلوماتك</Text>

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Icon name="account-circle" size={80} color="#ccc" />
                <Icon
                  name="camera"
                  size={30}
                  color="#009dff"
                  style={styles.cameraIcon}
                />
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="الاسم الكامل"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
            textAlign="right"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>حفظ</Text>
          </TouchableOpacity>
        </View>
        <InfoModal
          isVisible={infoVisible}
          onClose={() => setInfoVisible(false)}
          message={infoText}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Cairo",
    marginBottom: 20,
    color: "#031417",
  },
  imagePicker: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 60,
    right: 5,
    borderRadius: 20,
    padding: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    fontFamily: "Cairo",
    color: "#031417",
  },
  saveButton: {
    backgroundColor: "#009dff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo",
  },
});

export default NameImageModal;

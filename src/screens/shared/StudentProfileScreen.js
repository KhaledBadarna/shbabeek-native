import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { logout, setUserInfo } from "../../redux/slices/userSlice";
import { resetFavorites } from "../../redux/slices/favoritesSlice";
import { useNavigation } from "@react-navigation/native";
import { firestore } from "../../firebase";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import AuthModal from "../../components/modals/AuthModal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ProfitsScreen from "../teacher/ProfitsScreen";
import * as ImagePicker from "expo-image-picker";

const StudentProfileScreen = () => {
  const image = useSelector((state) => state.user.profileImage);
  const [profileImage, setProfileImage] = useState(image);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { name, phone, userId, userType } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(resetFavorites()); // ✅ Clear favorites on logout
    dispatch(logout());
    navigation.navigate("الرئيسية");
  };
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: false,
      });

      if (!result.cancelled) {
        const selectedImageUri = result.uri;
        setProfileImage(selectedImageUri);
        handleImageUpload(selectedImageUri);
      }
    } catch (error) {
      console.error("❌ Error picking image:", error);
    }
  };
  const handleImageUpload = async (imageUri) => {
    if (!imageUri) return;

    // ✅ Step 1: Update Redux Immediately for Instant UI Update
    dispatch(setUserInfo({ profileImage: imageUri }));

    let data = new FormData();
    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    });
    data.append("upload_preset", "profile_upload");
    data.append("cloud_name", "dmewlyit3");

    try {
      let res = await fetch(
        "https://api.cloudinary.com/v1_1/dmewlyit3/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      let json = await res.json();
      const imageUrl = json.secure_url;

      if (!imageUrl) {
        console.error("❌ Error: No image URL returned from Cloudinary.");
        return;
      }

      // ✅ Step 2: Update Firestore in Background
      const collectionName = userType === "teacher" ? "teachers" : "students";
      const userDocRef = doc(firestore, collectionName, userId);
      await updateDoc(userDocRef, { profileImage: imageUrl });

      // ✅ Step 3: Update Redux with Cloudinary URL (in case of format change)
      dispatch(setUserInfo({ profileImage: imageUrl }));

      console.log("✅ Image updated successfully in Firestore & Redux!");
    } catch (error) {
      console.error("🔥 Error uploading image:", error);
    }
  };

  const updatePhoneNumber = async (newPhone) => {
    console.log("📞 Checking if phone number exists:", newPhone);

    if (!userId) {
      console.error("🚨 Error: User ID is missing.");
      return;
    }

    try {
      const collectionName = userType === "teacher" ? "teachers" : "students";

      // ✅ Step 1: Check if the phone number already exists
      const usersCollectionRef = collection(firestore, collectionName);
      const q = query(usersCollectionRef, where("phone", "==", newPhone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("⚠️ Phone number already exists!"); // 🔥 Changed from console.error() to console.log()
        alert("⚠️ رقم الهاتف مستخدم بالفعل. الرجاء استخدام رقم آخر.");
        return; // ❌ Stop the update if phone already exists
      }

      // ✅ Step 2: Proceed with updating Firestore
      console.log("✅ Phone number is unique. Updating Firestore...");
      const userDocRef = doc(firestore, collectionName, userId);
      await updateDoc(userDocRef, { phone: newPhone });

      // ✅ Step 3: Update Redux without removing other user data
      dispatch(
        setUserInfo({
          name, // ✅ Keep existing name
          phone: newPhone, // ✅ Update only phone
          profileImage, // ✅ Keep existing profile image
          userId,
          userType,
          isLoggedIn: true,
        })
      );

      console.log("✅ Phone updated successfully!");
    } catch (error) {
      console.error("🔥 Error updating phone:", error);
    }
  };

  useEffect(() => {
    setProfileImage(image);
  }, [image]);

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <Icon name="person-circle-outline" size={100} color="#555" />
          )}

          {/* ✅ Fixed Camera Icon - Now calls pickImage */}
          <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
            <Icon name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{name}</Text>
        <Text style={styles.phoneNumber}>
          {phone ? phone.replace(/^(\d{3})(\d{4})(\d{3})$/, "$1-$2-$3") : ""}
        </Text>
      </View>
      {userType === "teacher" && (
        <View style={styles.teachersBtnContainer}>
          <TouchableOpacity
            style={styles.teachersButton}
            onPress={() => navigation.navigate("ProfitsScreen")}
          >
            <Icon name="finance" size={24} color="#031417" />
            <Text
              style={{
                color: "#031417",
                fontWeight: "bold",
                fontFamily: "Cairo",
              }}
            >
              ارباحي
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.teachersButton, { backgroundColor: "#00ddff" }]}
            onPress={() => navigation.navigate("TeacherSettingsScreen")}
          >
            <Icon name="badge-account-horizontal" size={24} color="#031417" />
            <Text
              style={{
                color: "#031417",
                fontWeight: "bold",
                fontFamily: "Cairo",
              }}
            >
              التفاصيل الشخصية
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => {
            setModalMode("updateName");
            setShowAuthModal(true);
          }}
        >
          <Icon name="pencil" size={24} color="#555" />
          <Text style={styles.optionText}>تغيير الاسم</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => {
            setModalMode("updatePhone");
            setShowAuthModal(true);
          }}
        >
          <Icon name="phone-plus" size={24} color="#555" />
          <Text style={styles.optionText}>تغيير رقم الهاتف</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow}>
          <Icon name="message" size={24} color="#555" />
          <Text style={styles.optionText}>تواصل مع شبايك</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow}>
          <Icon name="shield-lock" size={24} color="#555" />
          <Text style={styles.optionText}>سياسة الخصوصية</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.optionRow}>
          <Icon name="logout" size={24} color="#DF3F5E" />
          <Text style={[styles.optionText, { color: "#DF3F5E" }]}>
            تسجيل الخروج
          </Text>
        </TouchableOpacity>
      </View>

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={modalMode}
        onConfirm={modalMode === "updatePhone" ? updatePhoneNumber : null} // ❌ No need for updateUserName
        userId={userId}
        userType={userType}
        profileImage={profileImage}
        phoneNumber={phone}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 10,
  },
  profileContainer: {
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  profileImageContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Make the image circular
    backgroundColor: "#ddd", // Placeholder background
    borderWidth: 2,
    borderColor: "#009dff",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 5,
    backgroundColor: "#009dff",
    borderRadius: 20,
    padding: 5,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "semibold",
    marginTop: 10,
    fontFamily: "Cairo",
  },
  phoneNumber: {
    fontSize: 16,
    color: "#727272",
    fontFamily: "Cairo",
  },
  optionsContainer: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 10,
    borderRadius: 10,
    paddingBottom: 130,
    marginTop: 10,
  },
  optionRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 13,
    color: "#555",
    marginRight: 10,
    flex: 1,
    textAlign: "right",
    fontFamily: "Cairo",
  },
  icons: { backgroundColor: "#ebebeb", borderRadius: 10, padding: 5 },
  teachersButton: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#0efad3",
    width: "48%",
  },
  teachersBtnContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: "space-evenly",
  },
});

export default StudentProfileScreen;

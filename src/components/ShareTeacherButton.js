import React from "react";
import { TouchableOpacity, Alert } from "react-native";
import { Sharing } from "expo-sharing";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ShareTeacherButton = ({ teacherId }) => {
  const teacherProfileUrl = `https://shbabeek.com/teacher/${teacherId}`; // Web fallback

  const handleShare = async () => {
    try {
      // Check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(teacherProfileUrl, {
          dialogTitle: "Share this teacher on Shbabeek!",
          mimeType: "text/plain",
        });
      } else {
        Alert.alert("Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <TouchableOpacity onPress={handleShare}>
      <Icon
        name="share-variant-outline"
        size={25}
        color="#031417"
        style={{ marginRight: 10 }}
      />
    </TouchableOpacity>
  );
};

export default ShareTeacherButton;

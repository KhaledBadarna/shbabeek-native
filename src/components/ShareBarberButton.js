import React from "react";
import { TouchableOpacity, Alert, Share } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ShareBarberButton = ({ barberId }) => {
  const barberProfileUrl = `https://shbabeek.com/barber/${barberId}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `شوف المعلم على Shbabeek:\n${barberProfileUrl}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("حدث خطأ أثناء المشاركة");
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

export default ShareBarberButton;

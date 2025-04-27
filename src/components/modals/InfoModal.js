import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

const InfoModal = ({
  isVisible,
  onClose,
  message,
  confirmText = "تم",
  onConfirm,
}) => {
  const handlePress = () => {
    if (onConfirm) {
      onConfirm(); // إذا موجود onConfirm نفذه
    } else {
      onClose(); // إذا مش موجود onConfirm سكر فقط
    }
  };

  return (
    <Modal
      animationIn="bounceIn"
      animationOut="bounceOut"
      isVisible={isVisible}
      onBackdropPress={onClose}
    >
      <View style={styles.modalContent}>
        <Text style={styles.messageText}>{message}</Text>
        <TouchableOpacity onPress={handlePress} style={styles.closeButton}>
          <Text style={styles.closeText}>{confirmText}</Text>
          {/* ✅ نص الزر يجي من confirmText */}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  messageText: {
    fontFamily: "Cairo",
    fontSize: 16,
    color: "#031417",
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#009dff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo",
  },
});

export default InfoModal;

import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";

const ExitConfirmationModal = ({ visible, onCancel, onConfirm }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>تحذير</Text>
          <Text style={styles.modalMessage}>
            لديك تغييرات غير محفوظة، هل تريد المغادرة بدون الحفظ؟
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={onCancel}
            >
              <Text style={styles.modalButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonExit}
              onPress={onConfirm}
            >
              <Text style={styles.modalButtonText}>مغادرة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 🔹 Styles
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#031417",
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  modalButtonExit: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#E74C3C",
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ExitConfirmationModal;

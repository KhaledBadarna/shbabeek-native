import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ContactWhatsAppModal = ({ visible, onClose }) => {
  const phoneNumber = "972542636724"; // ✅ رقمك بصيغة دولية (972 بدون 0)
  const defaultMessage = "مرحباً، أحتاج مساعدة عبر تطبيق تواصل مع شبابيك 📚";

  const openWhatsApp = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      defaultMessage
    )}`;
    Linking.openURL(url);
    onClose(); // يغلق المودال بعد الضغط
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Icon name="close-circle-outline" size={28} color="#031417" />
          </TouchableOpacity>

          <Text style={styles.title}>تواصل مع شبابيك</Text>
          <Text style={styles.subtitle}>
            راسلنا عبر الواتساب، نحن هنا لمساعدتك!
          </Text>

          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={openWhatsApp}
          >
            <Icon
              name="whatsapp"
              size={28}
              color="#fff"
              style={{ marginLeft: 10 }}
            />
            <Text style={styles.buttonText}>فتح واتساب</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    alignItems: "center",
    height: "50%", // ⬅️ كنسبة من الشاشة
  },
  closeIcon: {
    position: "absolute",
    top: 15,
    left: 15,
  },
  title: {
    fontFamily: "Cairo",
    fontSize: 20,
    color: "#031417",
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 10,
  },
  buttonText: {
    fontFamily: "Cairo",
    fontSize: 18,
    color: "#fff",
  },
});

export default ContactWhatsAppModal;

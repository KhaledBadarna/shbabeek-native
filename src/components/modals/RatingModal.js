// RatingModal.js
import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const RatingModal = ({ visible, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    onSubmit(rating);
    setRating(0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>كيف تقيم الدرس؟</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity key={num} onPress={() => setRating(num)}>
                <Icon
                  name={rating >= num ? "star" : "star-outline"}
                  size={40}
                  color="#f7b500"
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>إرسال التقييم</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Cairo",
    marginBottom: 15,
    textAlign: "center",
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#00c2ff",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: "Cairo",
    color: "white",
    fontSize: 16,
  },
});

export default RatingModal;

import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const MessageModal = ({ lessonMessage, modalVisible, onClose }) => {
  const message = lessonMessage; // Simplified to directly access the first message

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={true} // Modal overlay with background transparency
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close-circle-outline" size={30} color="#031417" />
          </TouchableOpacity>

          {/* Scrollable content in the modal */}
          <ScrollView contentContainerStyle={styles.messageContentContainer}>
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{message}</Text>

              <View style={styles.filesContainer}>
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={() => {
                    /* Handle file download here */
                  }}
                >
                  <Icon name="cloud-download" size={24} color="#fff" />
                  <Text style={styles.fileText}>تحميل الملف</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContainer: {
    width: "90%",
    height: 400, // Fixed height for the modal
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  messageContentContainer: {
    flexGrow: 1,
    justifyContent: "flex-start", // Ensures content starts at the top
  },
  messageContainer: {
    marginBottom: 10,
    borderRadius: 4,
    justifyContent: "flex-start", // Ensures content is aligned to the top of the container
  },
  messageText: {
    fontSize: 13,
    color: "#031417",
    fontFamily: "Cairo",
    borderWidth: 1,
    padding: 10, // Adjusted padding
    borderRadius: 20,
    backgroundColor: "#fff",
    borderColor: "#cacaca",
    textAlign: "right", // Align the text to the right
    paddingTop: 10, // Add top padding to align text to the top
    minHeight: 200,
  },
  filesContainer: {
    marginTop: 10,
  },
  fileButton: {
    backgroundColor: "#00e5ff",
    padding: 10,
    marginBottom: 5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    width: "45%",
  },
  fileText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 5,
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
});

export default MessageModal;

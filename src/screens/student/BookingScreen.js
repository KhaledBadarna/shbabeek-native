import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { handleBooking } from "../../utils/handleBooking";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PaymentMethodModal from "../../components/modals/PaymentMethodModal";
const BookingScreen = ({ route }) => {
  const { selectedSlot, selectedDate, topicName, teacherId, teacher } =
    route.params; // ✅ Get params from navigation

  const [message, setMessage] = useState(""); // Student's message
  const [fileAttached, setFileAttached] = useState(null); // Store attached file
  const [selectedTopic, setSelectedTopic] = useState(""); // Store selected topic
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Show success message
  const [openPaymentMEthod, setOpenPaymentMethod] = useState(false);
  const studentId = useSelector((state) => state.user.userId); // Redux: Get student ID
  const defaultPaymentMethod = useSelector(
    (state) => state.user.defaultPaymentMethod
  ); // Redux: Get student ID

  const scrollViewRef = useRef(null); // Create a reference to the ScrollView
  const dispatch = useDispatch();
  useEffect(() => {
    // Set the default topic if topicName has a value, otherwise keep it unchosen
    if (topicName && topicName.length > 0) {
      setSelectedTopic(topicName); // Default to the topic passed in props
    } else {
      setSelectedTopic(""); // No topic selected if topicName is empty or undefined
    }
  }, [topicName]);

  // Handle booking
  const handleSend = async () => {
    try {
      if (!studentId) {
        alert("Student ID is required!");
        return;
      }

      await handleBooking(
        teacher,
        teacherId,
        selectedSlot,
        selectedDate,
        studentId,
        message,
        fileAttached,
        selectedTopic, // Pass the selected topic to the booking
        dispatch
      );

      // Show success message
      setShowSuccessMessage(true);
    } catch (error) {
      alert("Error booking lesson. Please try again.");
    }
  };

  // Handle file attachment
  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles], // You can customize this
        allowMultiSelection: false,
      });

      if (result && result[0]) {
        setFileAttached(result[0]); // result is an array
      } else {
        console.log("No file selected.");
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log("User canceled file selection.");
      } else {
        console.error("Error picking file:", error);
      }
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {showSuccessMessage ? (
          <View style={styles.successMessageContainer}>
            <Icon name="checkmark-circle" size={50} color="#009dff" />
            <Text style={styles.successMessageText}>
              تم حجز الدرس بنجاح! الرجاء انتظار موافقة المعلم على الطلب
            </Text>
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottomColor: "#f1f1f1",
                borderBottomWidth: 1,
                padding: 10,
              }}
            >
              <Image
                source={{ uri: teacher.profileImage }}
                style={styles.profileImage}
              />
              <Text
                style={{
                  fontFamily: "Cairo",
                  fontWeight: "900",
                  fontSize: "20",
                  color: "#031417",
                }}
              >
                {teacher.name}
              </Text>
            </View>

            <View style={styles.timeContainer}>
              <Text style={styles.selectedTimeText}>
                {selectedSlot.day}, {selectedDate}
              </Text>
              <Text style={styles.selectedTimeText}>
                <Icon name="clock-time-ten" size={15} color="#031417" />{" "}
                {selectedSlot.startTime}-{selectedSlot.endTime}
              </Text>
            </View>
            {/* Topic Buttons */}
            <View
              style={{ borderBottomWidth: 1, borderBottomColor: "#f1f1f1" }}
            >
              <Text style={styles.selectTopicText}>اختر الموضوع:</Text>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                contentContainerStyle={styles.topicButtonsContainer}
                onContentSizeChange={() =>
                  scrollViewRef.current.scrollToEnd({ animated: false })
                }
              >
                {teacher.topics.map((topic, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.topicButton,
                      selectedTopic === topic && styles.selectedTopicButton,
                    ]}
                    onPress={() => setSelectedTopic(topic)}
                  >
                    <Text
                      style={[
                        styles.topicButtonText,
                        selectedTopic === topic &&
                          styles.selectedTopicButtonText,
                      ]}
                    >
                      {topic}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                paddingVertical: 15,
                borderBottomColor: "#f1f1f1",
                borderBottomWidth: 1,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Cairo",
                    fontWeight: "700",
                    fontSize: 17,
                  }}
                >
                  {teacher.pricePerHour} ₪
                </Text>
                <Text
                  style={{
                    fontFamily: "Cairo",
                    fontSize: 10,
                    color: "#959595",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Cairo",
                      fontSize: 15,
                      color: "#031417",
                    }}
                  >
                    50 دقيقة
                  </Text>
                  {"   "}
                  (الوقت الفعلي للدرس)
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Cairo",
                    fontSize: 15,
                    color: "#031417",
                  }}
                >
                  1.13 ₪
                </Text>
                <Text
                  style={{
                    fontFamily: "Cairo",
                    fontSize: 15,
                    color: "#031417",
                  }}
                >
                  رسوم اضافية
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 15,
                borderBottomColor: "#f1f1f1",
                borderBottomWidth: 1,
              }}
            >
              <Text
                style={{
                  fontFamily: "Cairo",
                  fontSize: 17,
                  color: "#031417",
                  fontWeight: "700",
                }}
              >
                101.13 ₪
              </Text>
              <Text
                style={{
                  fontFamily: "Cairo",
                  fontSize: 17,
                  color: "#031417",
                  fontWeight: "700",
                }}
              >
                اجمالي المبلغ
              </Text>
            </View>
            {/* payment method */}
            <View
              style={{
                paddingVertical: 15,
                borderBottomColor: "#f1f1f1",
                borderBottomWidth: 1,
              }}
            >
              <Text
                style={{
                  fontFamily: "Cairo",
                  fontSize: 17,
                  color: "#031417",
                  fontWeight: "700",
                  textAlign: "right",
                  marginBottom: 20,
                }}
              >
                طريقة الدفع
              </Text>
              <TouchableOpacity
                onPress={() => setOpenPaymentMethod(true)}
                style={styles.paymentMethodButton}
              >
                <Text
                  style={{
                    fontFamily: "Cairo",
                    fontSize: 15,
                    color: "#031417",
                  }}
                >
                  <Icon name="apple" size={15} color="#031417" /> Apple Pay
                </Text>
                <Text
                  style={{
                    fontFamily: "Cairo",
                    fontSize: 15,
                    color: "#031417",
                  }}
                >
                  تعديل
                </Text>
              </TouchableOpacity>
            </View>

            {/* Buttons - Attach file and send */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                onPress={handleAttachFile}
                style={styles.attachFileButton}
              >
                <Icon name="attachment" size={24} color="#00adf0" />
                <Text style={styles.attachFileText}>
                  {fileAttached
                    ? `ملف مرفق: ${fileAttached.name}`
                    : "إرفاق ملف"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
      <PaymentMethodModal
        visible={openPaymentMEthod}
        setOpenPaymentMethod={setOpenPaymentMethod}
      />
      {!showSuccessMessage && (
        <View style={styles.fixedPayButtonContainer}>
          <TouchableOpacity style={styles.payButton} onPress={handleSend}>
            <Text style={styles.payButtonText}>
              الدفع باستخدام {defaultPaymentMethod}
            </Text>
            <Icon name="apple" size={30} color="#00d9ff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Style definitions
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",

    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "semisemibold",
    marginBottom: 5,
    textAlign: "center",
    fontFamily: "Cairo",
  },
  timeContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  selectedTimeText: {
    fontSize: 17,
    color: "#031417",
    fontFamily: "Cairo",
    borderRadius: 20,
    fontWeight: "600",
  },
  selectTopicText: {
    fontSize: 13,
    color: "#031417",
    marginVertical: 5,
    fontFamily: "Cairo",
    textAlign: "right",
  },
  topicButtonsContainer: {
    flexDirection: "row-reverse",
    marginVertical: 10,
    paddingVertical: 5,
  },
  topicButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ebebeb",
    borderWidth: 1,
  },
  selectedTopicButton: {
    borderColor: "#00e5ff",
    color: "#031417",
  },
  buttonText: {
    color: "#031417",
    fontSize: 16,
    fontFamily: "Cairo",
  },
  attachFileButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#00e5ff",
  },
  sendButton: {
    backgroundColor: "#00e5ff",
    borderRadius: 10,
    padding: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#00e5ff",
  },
  topicButtonText: { fontFamily: "Cairo", fontSize: 13, color: "#8b8a8a" },
  selectedTopicButtonText: { color: "#00e5ff", fontWeight: "500" },
  paymentMethodButton: {
    borderWidth: 1.5,
    borderColor: "#e5eaed",
    borderRadius: 5,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fixedPayButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  payButton: {
    backgroundColor: "#031417",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center", // ✅ Center content horizontally
    marginHorizontal: 25,
    flexDirection: "row-reverse",
    gap: 10, // ✅ Adds space between text and icon (RN 0.71+)
  },

  payButtonText: {
    fontFamily: "Cairo",
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default BookingScreen;

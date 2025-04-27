import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import InfoModal from "../components/modals/InfoModal";

const LessonsCard = ({ lessons = [] }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const { userType } = useSelector((state) => state.user);
  const navigation = useNavigation();
  const isTesting = false;

  // ✅✅✅ put this OUTSIDE any function
  const formatName = (fullName) => {
    if (!fullName) return "";
    const [first, last = ""] = fullName.trim().split(" ");
    return `${first} ${last.charAt(0)}.`.trim();
  };

  const handleEnterLesson = (item) => {
    const now = new Date();
    const lessonStart = new Date(`${item.selectedDate}T${item.startTime}:00`);
    if (isTesting) {
      if (now < lessonStart) {
        setModalMessage("⏳ لا يمكنك دخول الدرس قبل موعده.");
        setModalVisible(true);
        return;
      }
    }

    navigation.navigate("LessonCallScreen", {
      roomName: item.id,
      oppositeUser: item.oppositeUser?.name,
      lessonId: item.id,
      teacherId: item.teacherId,
      paidAmount: item.paidAmount,
      userType: userType,
    });
  };

  if (!lessons || lessons.length === 0) {
    return (
      <Text style={styles.noLessonsText}>لا يوجد مواعيد متاحة لهذا اليوم</Text>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: 300, marginTop: 15 }}
      data={lessons}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.lessonContainer}>
          <View style={styles.userImage}>
            <Image
              source={{ uri: item.oppositeUser?.profileImage || "" }}
              style={styles.profileImage}
            />
            <Text style={styles.lessonDate}>
              {formatName(item.oppositeUser?.name) || "Unknown User"}
            </Text>
          </View>

          <View style={styles.lessonDetailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.lessonTopic}>{item.selectedTopic}</Text>
              <Icon
                style={{ marginLeft: 5 }}
                name="bookshelf"
                size={20}
                color="#031417"
              />
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.lessonDate}>
                {item.startTime} - {item.endTime}
              </Text>
              <Icon name="clock-time-ten-outline" size={20} color="#031417" />
            </View>

            <TouchableOpacity
              style={styles.enterLessonButton}
              onPress={() => handleEnterLesson(item)}
            >
              <Text style={styles.enterLessonButtonText}>دخول الدرس</Text>
            </TouchableOpacity>
          </View>
          <InfoModal
            isVisible={modalVisible}
            onClose={() => setModalVisible(false)}
            message={modalMessage}
            confirmText="تم"
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  lessonContainer: {
    position: "relative",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f2f2f2",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  userImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 65,
    height: 65,
    borderWidth: 1.5,
    borderRadius: 10,
    borderColor: "#e1e1e1",
  },
  lessonDate: {
    fontSize: 14,
    color: "#031417",
    fontFamily: "Cairo",
    marginRight: 5,
  },
  lessonTopic: {
    fontSize: 14,
    color: "#031417",
    fontFamily: "Cairo",
  },
  lessonDetailsContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    borderRightWidth: 3.5,
    paddingHorizontal: 20,
    borderColor: "#009dff",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  enterLessonButton: {
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    padding: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    width: "100%",
    shadowColor: "#031417",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    backgroundColor: "#fff",
  },
  enterLessonButtonText: {
    color: "#031417",
    fontSize: 13,
    fontFamily: "Cairo",
  },
  noLessonsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    fontFamily: "Cairo",
    marginTop: 30,
  },
});

export default LessonsCard;

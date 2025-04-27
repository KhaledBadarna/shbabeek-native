import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from "react-native";
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
} from "react-native-agora";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import InfoModal from "../../components/modals/InfoModal"; // your InfoModal
import handleLessonEnd from "../../utils/handleLessonEnd"; // your lesson end function
import { removeLesson } from "../../redux/slices/lessonsSlice";
import { useDispatch } from "react-redux";

const APP_ID = "15ef0849bb20486ba1a533f2e976d7fc"; // your Agora App ID
const CHANNEL_NAME = "lesson123";
const TOKEN = null;
const UID = 0;

const LessonCallScreen = ({ navigation, route }) => {
  const {
    lessonId,
    teacherId,
    paidAmount,
    startTime,
    endTime,
    selectedDate,
    roomName,
    userType,
  } = route.params;
  const [engine] = useState(() => createAgoraRtcEngine());
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const timerRef = useRef(null);
  const LESSON_DURATION = 60 * 60 * 1000; // 1 ساعة = 3600 ثانية × 1000 = بالمللي ثانية
  const [timeLeft, setTimeLeft] = useState(LESSON_DURATION);

  const isTesting = true; // 🔥 set to true for easy test, no need wait for real time!

  const handleLeave = async () => {
    try {
      await handleLessonEnd(lessonId, teacherId, paidAmount, 0, userType);
    } catch (error) {
      console.error("❌ handleLessonEnd error but continue:", error);
    }

    dispatch(removeLesson(lessonId));

    try {
      engine.leaveChannel();
    } catch (err) {
      console.error("❌ leaveChannel error:", err);
    }

    navigation.navigate("Home", {
      screen: "الرئيسية",
      params: { showRating: true, lessonId, teacherId, paidAmount },
    });
  };

  const toggleMic = () => {
    engine.muteLocalAudioStream(micOn);
    setMicOn((prev) => !prev);
  };

  const toggleCamera = () => {
    engine.muteLocalVideoStream(camOn);
    setCamOn((prev) => !prev);
  };

  const handleEndPress = () => {
    if (isTesting) {
      handleLeave(); // فورا ينهي الدرس لو وضع اختبار
      return;
    }

    if (timeLeft > 10 * 60 * 1000) {
      // اذا باقي أكثر من 10 دقايق
      setModalMessage("❌ لا يمكنك إنهاء الدرس إلا في آخر 10 دقائق من الحصة.");
      setModalVisible(true);
    } else {
      setModalMessage("هل أنت متأكد أنك تريد إنهاء الجلسة؟");
      setShowConfirm(true);
    }
  };

  const setupAgora = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }

    engine.initialize({
      appId: APP_ID,
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });

    engine.registerEventHandler({
      onJoinChannelSuccess: () => setJoined(true),
      onUserJoined: (connection, uid) => setRemoteUid(uid),
      onUserOffline: () => setRemoteUid(null),
    });

    engine.enableVideo();
    engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
    engine.joinChannel(TOKEN, roomName || CHANNEL_NAME, UID);
  };

  useEffect(() => {
    setupAgora();
    return () => {
      clearInterval(timerRef.current);
      engine.leaveChannel();
      engine.release();
    };
  }, []);

  return (
    <View style={{ flex: 1, position: "relative" }} pointerEvents="box-none">
      {joined && remoteUid !== null && (
        <RtcSurfaceView
          canvas={{ uid: remoteUid }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}

      {joined && camOn && (
        <View style={styles.cameraOverlay} pointerEvents="box-none">
          <RtcSurfaceView
            canvas={{ uid: 0 }}
            style={{ flex: 1 }}
            pointerEvents="none"
          />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls} pointerEvents="box-none">
        <TouchableOpacity onPress={toggleMic} style={styles.controlButton}>
          <Icon
            name={micOn ? "microphone" : "microphone-off"}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleCamera} style={styles.controlButton}>
          <Icon name={camOn ? "video" : "video-off"} size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleEndPress}
          style={[styles.controlButton, { backgroundColor: "#ff4444" }]}
        >
          <Icon name="phone-hangup" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
        pointerEvents="box-none"
      >
        <InfoModal
          isVisible={showConfirm}
          onClose={() => setShowConfirm(false)}
          message={modalMessage}
          confirmText="نعم، إنهاء"
          onConfirm={() => {
            setShowConfirm(false);
            handleLeave(); // ✅ real end session here
          }}
        />
        <InfoModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          message={modalMessage}
          confirmText="تم"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cameraOverlay: {
    position: "absolute",
    top: 20,
    right: 20,
    width: "25%",
    aspectRatio: 3 / 4,
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 20,
  },
  controls: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    zIndex: 30,
  },
  controlButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 50,
  },
});

export default LessonCallScreen;

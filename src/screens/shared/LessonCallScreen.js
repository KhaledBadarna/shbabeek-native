import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
  VideoRenderModeType,
} from "react-native-agora";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { WebView } from "react-native-webview";
import handleLessonEnd from "../../utils/handleLessonEnd";
import { removeLesson } from "../../redux/slices/lessonsSlice";
import { useDispatch } from "react-redux";
const APP_ID = "15ef0849bb20486ba1a533f2e976d7fc";
const CHANNEL_NAME = "lesson123";
const TOKEN = null;
const UID = 0;
const LESSON_DURATION = 60 * 60 * 1000;

const LessonCallScreen = ({ navigation, route }) => {
  const {
    lessonId,
    teacherId,
    paidAmount,
    startTime,
    endTime,
    selectedDate,
    roomName,
  } = route.params;
  const [engine] = useState(() => createAgoraRtcEngine());
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(LESSON_DURATION);
  const timerRef = useRef(null);
  const dispatch = useDispatch();
  const hasLeftRef = useRef(false);
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          stopTimer();
          handleLeave();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  };
  useEffect(() => {
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
        onJoinChannelSuccess: () => {
          setJoined(true);
        },
        onUserJoined: (connection, uid) => setRemoteUid(uid),
        onUserOffline: () => setRemoteUid(null),
      });

      engine.enableVideo(); // ✅ must be after initialize
      engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
      engine.joinChannel(TOKEN, roomName || CHANNEL_NAME, UID);
    };

    setupAgora();

    return () => {
      stopTimer();
      engine.leaveChannel();
      engine.release();
    };
  }, []);
  useEffect(() => {
    if (joined) {
      startTimer();
    }
  }, [joined]);
  // const requestPermissions = async () => {
  //   await PermissionsAndroid.requestMultiple([
  //     PermissionsAndroid.PERMISSIONS.CAMERA,
  //     PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  //   ]);
  // };
  const isTesting = true;

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTesting) return;
      const now = new Date();
      const start = new Date(`${selectedDate}T${startTime}:00`);
      const end = new Date(`${selectedDate}T${endTime}:00`);

      if (now < start) {
        setTimeLeft(start - now); // ⏳ waiting to start
      } else if (now >= start && now < end) {
        setTimeLeft(end - now); // ✅ countdown in progress
      } else {
        setTimeLeft(0);
        if (!hasLeftRef.current) {
          hasLeftRef.current = true;
          handleLeave(); // ✅ only once
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const min = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const sec = String(totalSec % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const toggleMic = () => {
    engine.muteLocalAudioStream(micOn);
    setMicOn((prev) => !prev);
  };

  const toggleCamera = () => {
    engine.muteLocalVideoStream(camOn);
    setCamOn((prev) => !prev);
  };

  handleLeave = async () => {
    await handleLessonEnd(lessonId, teacherId, paidAmount, 0); // ✅ Update Firestore
    dispatch(removeLesson(lessonId)); // ✅ Instantly clear from Redux
    engine.leaveChannel();
    stopTimer();
    navigation.navigate("Home", {
      screen: "الرئيسية",
      params: { showRating: true, lessonId, teacherId, paidAmount },
    });
  };
  return (
    <View style={styles.container}>
      {/* <WebView
        source={{
          uri: `https://whiteboard.agora.io/board.html?appId=${APP_ID}&channel=${
            roomName || CHANNEL_NAME
          }`,
        }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
      /> */}

      {/* Remote user full screen */}
      {joined && remoteUid !== null && (
        <RtcSurfaceView
          canvas={{ uid: remoteUid }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Local user camera (1/4 screen floating) */}
      {joined && camOn && (
        <View style={styles.cameraOverlay}>
          <RtcSurfaceView canvas={{ uid: 0 }} style={{ flex: 1 }} />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
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
          onPress={handleLeave}
          style={[styles.controlButton, { backgroundColor: "#ff4444" }]}
        >
          <Icon name="phone-hangup" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
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
  timer: {
    color: "#fff",
    fontSize: 18,
    marginRight: 10,
  },
  remote: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
});

export default LessonCallScreen;

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

const APP_ID = "15ef0849bb20486ba1a533f2e976d7fc";
const CHANNEL_NAME = "lesson123";
const TOKEN = null;
const UID = 0;
const LESSON_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const LessonCallScreen = ({ navigation }) => {
  const [engine] = useState(() => createAgoraRtcEngine());
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(LESSON_DURATION);
  const timerRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === "android") requestPermissions();

    engine.initialize({
      appId: APP_ID,
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });

    engine.registerEventHandler({
      onJoinChannelSuccess: () => {
        setJoined(true);
        startTimer();
      },
      onUserJoined: (connection, uid) => setRemoteUid(uid),
      onUserOffline: (connection, uid) => setRemoteUid(null),
    });

    engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
    engine.enableVideo();
    engine.joinChannel(TOKEN, CHANNEL_NAME, UID);

    return () => {
      stopTimer();
      engine.leaveChannel();
      engine.release();
    };
  }, []);

  const requestPermissions = async () => {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
  };

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

  const handleLeave = () => {
    engine.leaveChannel();
    stopTimer();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {joined && camOn && (
        <RtcSurfaceView canvas={{ uid: 0 }} style={styles.fullScreen} />
      )}
      {joined && remoteUid !== null && (
        <RtcSurfaceView
          canvas={{ uid: remoteUid }}
          style={styles.remote}
          renderMode={VideoRenderModeType.VideoRenderModeHidden}
        />
      )}

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
  fullScreen: { flex: 1 },
  remote: {
    width: 120,
    height: 160,
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#222",
  },
  controls: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
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
});

export default LessonCallScreen;

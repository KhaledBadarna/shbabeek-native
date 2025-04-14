import React, { useEffect } from "react";
import { View } from "react-native";
import JitsiMeet, { JitsiMeetView } from "react-native-jitsi-meet";

const LessonCallScreen = ({ route, navigation }) => {
  const { roomName, userName } = route.params;

  useEffect(() => {
    const url = `https://meet.jit.si/${roomName}`;
    const userInfo = {
      displayName: userName,
    };
    setTimeout(() => {
      JitsiMeet.call(url, userInfo);
    }, 1000);

    return () => {
      JitsiMeet.endCall();
    };
  }, []);

  return (
    <JitsiMeetView
      style={{ flex: 1 }}
      onConferenceTerminated={() => navigation.goBack()}
    />
  );
};

export default LessonCallScreen;

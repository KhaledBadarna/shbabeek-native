import React, { useEffect, useState } from "react";
import { View } from "react-native";
import JitsiMeet, { JitsiMeetView } from "react-native-jitsi-meet";
import RatingModal from "../../components/modals/RatingModal";
import { updateDoc, doc, increment, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase";

const LessonCallScreen = ({ route, navigation }) => {
  const { roomName, oppositeUser, lessonId, teacherId, paidAmount } =
    route.params;

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const url = `https://meet.jit.si/${roomName}`;
    const userInfo = { displayName: oppositeUser };

    setTimeout(() => {
      JitsiMeet.call(url, userInfo, {
        audioMuted: true,
        videoMuted: false,
        featureFlags: {
          "welcomepage.enabled": false,
          "pip.enabled": false,
          "add-people.enabled": false,
          "calendar.enabled": false,
          "recording.enabled": true,
          "live-streaming.enabled": true,
          "meeting-name.enabled": true,
          "toolbox.alwaysVisible": true,
          "ios.screensharing.enabled": true,
        },
      });
    }, 500);

    return () => {
      JitsiMeet.endCall();
    };
  }, []);

  const handleLessonEnd = async (rating) => {
    try {
      await updateDoc(doc(firestore, "lessons", lessonId), {
        isLessonCompleted: true,
      });

      const teacherRef = doc(firestore, "teachers", teacherId);
      const teacherSnap = await getDoc(teacherRef);
      const teacherData = teacherSnap.data();

      const currentRating = teacherData.rating || 0;
      const currentRatingCount = teacherData.ratingCount || 0;

      const updatePayload = {
        lessonsCount: increment(1),
        pendingPayout: increment(paidAmount),
      };
      if (rating > 0) {
        const newAverage =
          (currentRating * currentRatingCount + rating) /
          (currentRatingCount + 1);

        updatePayload.ratingCount = increment(1);
        updatePayload.rating = Number(newAverage.toFixed(1)); // ✅ Round to 1 decimal place
      }

      await updateDoc(teacherRef, updatePayload);
    } catch (err) {
      console.error("❌ Error updating lesson or teacher stats:", err);
    }

    navigation.navigate("Home");
  };

  return (
    <>
      <JitsiMeetView
        style={{ flex: 1 }}
        onConferenceTerminated={() => setShowModal(true)}
      />
      {showModal && (
        <RatingModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={(rating) => {
            setShowModal(false);
            handleLessonEnd(rating);
          }}
        />
      )}
    </>
  );
};

export default LessonCallScreen;

// StudentLessonsScreen.js
import React, { useEffect, useState, useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import fetchLessons from "../../utils/fetchLessons";
import WeeklyDateSelector from "../../components/WeeklyDateSelector";
import LessonsCard from "../../components/LessonsCard";
import { selectLessons } from "../../redux/selectors/lessonsSelectors";

const StudentLessonsScreen = () => {
  const dispatch = useDispatch();
  const { userType, userId } = useSelector((state) => state.user);
  const lessons = useSelector(selectLessons);
  const loading = useSelector((state) => state.loading || false);

  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchLessons(userType, userId, dispatch);
  }, [userId, userType, dispatch]);

  const lessonsForDate = useMemo(() => {
    return lessons.filter(
      (lesson) =>
        lesson.selectedDate === selectedDate && !lesson.isLessonCompleted
    );
  }, [lessons, selectedDate]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0095ff" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ backgroundColor: "#fff", padding: 10, borderRadius: 10 }}>
        <WeeklyDateSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          availableSlots={lessons.filter((lesson) => !lesson.isLessonCompleted)}
          type="lessons"
        />

        <LessonsCard
          lessons={[...lessonsForDate].sort((a, b) => {
            const toMinutes = (t) => {
              const [h, m] = t.split(":").map(Number);
              return h * 60 + m;
            };
            return toMinutes(a.startTime) - toMinutes(b.startTime);
          })}
        />
      </View>
    </View>
  );
};

export default StudentLessonsScreen;

// LessonsCard.js

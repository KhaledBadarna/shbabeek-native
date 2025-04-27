import React, { useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import { setLessons } from "../../redux/slices/lessonsSlice";
import LessonsCard from "../../components/LessonsCard";
import WeeklyDateSelector from "../../components/WeeklyDateSelector";
import { Timestamp } from "firebase/firestore";

const TeacherHomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [hasAvailability, setHasAvailability] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const lessons = useSelector((state) => state.lessons);
  const teacherData = useSelector((state) => state.teacher);
  const {
    name,
    profileImage,
    userId: teacherId,
  } = useSelector((state) => state.user);

  useEffect(() => {
    if (!teacherId) return;

    const q = query(
      collection(firestore, "lessons"),
      where("teacherId", "==", teacherId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const updatedLessons = [];

      for (const docSnap of snapshot.docs) {
        let lesson = { id: docSnap.id, ...docSnap.data() };
        const studentDocRef = doc(firestore, "students", lesson.studentId);
        const studentSnap = await getDoc(studentDocRef);

        lesson.oppositeUser = studentSnap.exists()
          ? {
              id: studentSnap.id,
              name: studentSnap.data().name || "Unknown",
              profileImage: studentSnap.data().profileImage || "",
            }
          : { name: "Unknown", profileImage: "" };

        updatedLessons.push({
          ...lesson,
          createdAt:
            lesson.createdAt instanceof Timestamp
              ? lesson.createdAt.toDate().toISOString()
              : lesson.createdAt,
          endedAt:
            lesson.endedAt instanceof Timestamp
              ? lesson.endedAt.toDate().toISOString()
              : lesson.endedAt,
        });
      }

      dispatch(setLessons(updatedLessons));
    });

    return () => unsubscribe();
  }, [teacherId]);

  useFocusEffect(
    useCallback(() => {
      const fetchLessonsAndAvailability = async () => {
        if (!teacherId) return;

        // Fetch lessons
        try {
          const q = query(
            collection(firestore, "lessons"),
            where("teacherId", "==", teacherId)
          );
          const snapshot = await getDocs(q);
          const fetchedLessons = [];

          for (const docSnap of snapshot.docs) {
            let lesson = { id: docSnap.id, ...docSnap.data() };
            const studentDocRef = doc(firestore, "students", lesson.studentId);
            const studentSnap = await getDoc(studentDocRef);

            lesson.oppositeUser = studentSnap.exists()
              ? {
                  id: studentSnap.id,
                  name: studentSnap.data().name || "Unknown",
                  profileImage: studentSnap.data().profileImage || "",
                }
              : { name: "Unknown", profileImage: "" };

            fetchedLessons.push({
              ...lesson,
              createdAt:
                lesson.createdAt instanceof Timestamp
                  ? lesson.createdAt.toDate().toISOString()
                  : lesson.createdAt,
              endedAt:
                lesson.endedAt instanceof Timestamp
                  ? lesson.endedAt.toDate().toISOString()
                  : lesson.endedAt,
            });
          }

          dispatch(setLessons(fetchedLessons));
        } catch (error) {
          console.error("❌ Error fetching lessons:", error);
        }

        // Fetch availability
        try {
          const ref = doc(firestore, "teacher_availability", teacherId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const allSlots = snap.data().slots || {};
            const flatSlots = Object.values(allSlots).flat();
            setHasAvailability(flatSlots.length > 0);
          } else {
            setHasAvailability(false);
          }
        } catch (err) {
          console.error("❌ Error checking availability:", err);
          setHasAvailability(false);
        }
      };

      fetchLessonsAndAvailability();
    }, [dispatch, teacherId])
  );

  const hasNoInfo =
    !teacherData?.bio ||
    !teacherData?.pricePerHour ||
    !teacherData?.topics?.length ||
    !teacherData?.stages?.length ||
    !teacherData?.bankDetails?.fullName;

  const currentWeekDates = (() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return [...Array(7)].map((_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date.toISOString().split("T")[0];
    });
  })();

  const hasLessonsThisWeek = lessons.some((lesson) =>
    currentWeekDates.includes(lesson.selectedDate)
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.greetingRow}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../../assets/noUserImage.png")
            }
            style={styles.profileImage}
          />
          <Text style={styles.greeting}>مرحبا استاذ: {name}!</Text>
        </View>
        <Text style={styles.subTitle}>ابدا الربح الآن!</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.comingLessonsText}>الدروس القادمة:</Text>
        <WeeklyDateSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          availableSlots={lessons.filter((l) => !l.isLessonCompleted)} // 👈 exclude completed lessons
          type="lessons"
        />
        <LessonsCard
          lessons={lessons
            .filter(
              (lesson) =>
                lesson.selectedDate === selectedDate &&
                !lesson.isLessonCompleted // 👈 hide completed lessons
            )
            .sort((a, b) => {
              const toMinutes = (time) => {
                const [h, m] = time.split(":").map(Number);
                return h * 60 + m;
              };
              return toMinutes(a.startTime) - toMinutes(b.startTime);
            })}
        />
      </View>

      {!hasLessonsThisWeek && (
        <View style={styles.infoBox}>
          {hasNoInfo ? (
            <>
              <Text style={styles.infoText}>
                لم تقم بعد بإدخال معلوماتك! ابدأ الآن وابدأ في جني الأموال.
              </Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => navigation.navigate("TeacherSettingsScreen")}
              >
                <Text style={styles.infoButtonText}>أكمل معلوماتك</Text>
              </TouchableOpacity>
            </>
          ) : !hasAvailability ? (
            <>
              <Text style={styles.infoText}>
                لم تقم بإضافة أوقات متاحة للحجز. أضف أوقات وابدأ في جني الأموال!
              </Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => navigation.navigate("TeacherAvailability")}
              >
                <Text style={styles.infoButtonText}>إضافة أوقات الحجز</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f5f5f5", paddingHorizontal: 15 },
  headerContainer: {
    backgroundColor: "#fff",
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#009dff",
  },
  greeting: {
    color: "#031417",
    fontSize: 16,
    textAlign: "right",
    fontFamily: "Cairo",
    fontWeight: "700",
  },
  subTitle: {
    fontSize: 13,
    color: "#009dff",
    marginBottom: 20,
    textAlign: "right",
    fontFamily: "Cairo",
  },
  section: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  comingLessonsText: {
    fontFamily: "Cairo",
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 5,
  },
  infoBox: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  infoText: {
    fontFamily: "Cairo",
    textAlign: "center",
    fontSize: 14,
    color: "#031417",
    marginBottom: 10,
  },
  infoButton: {
    backgroundColor: "#009dff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  infoButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo",
  },
});

export default TeacherHomeScreen;

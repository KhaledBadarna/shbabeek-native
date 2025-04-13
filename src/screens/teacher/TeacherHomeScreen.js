import React, { useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native"; // ✅ Import correctly
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
import { setLessons } from "../../redux/slices/lessonsSlice"; // ✅ Import Redux action
import LessonsCard from "../../components/LessonsCard";
import { Timestamp } from "firebase/firestore";
import WeeklyDateSelector from "../../components/WeeklyDateSelector";
const TeacherHomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const lessons = useSelector((state) => state.lessons); // ✅ GET LESSONS HERE

  const dispatch = useDispatch();
  const {
    name,
    profileImage,
    userId: teacherId,
  } = useSelector((state) => state.user); // ✅ Get teacher ID

  // ✅ 1️⃣ Use Firestore `onSnapshot` for Real-Time Updates
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

        // ✅ Fetch Opposite User (Student) Details
        const studentDocRef = doc(firestore, "students", lesson.studentId);
        const studentSnap = await getDoc(studentDocRef);

        if (studentSnap.exists()) {
          lesson.oppositeUser = {
            id: studentSnap.id,
            name: studentSnap.data().name || "Unknown",
            profileImage: studentSnap.data().profileImage || "",
          };
        } else {
          lesson.oppositeUser = { name: "Unknown", profileImage: "" };
        }

        updatedLessons.push({
          ...lesson,
          createdAt:
            lesson.createdAt instanceof Timestamp
              ? lesson.createdAt.toDate().toISOString()
              : lesson.createdAt,
        });
      }

      dispatch(setLessons(updatedLessons)); // ✅ Now Redux-safe
    });

    return () => unsubscribe(); // Cleanup listener
  }, [teacherId, dispatch]);

  // ✅ 2️⃣ Fetch Fresh Data When Entering Screen (useFocusEffect)
  useFocusEffect(
    useCallback(() => {
      const fetchLessons = async () => {
        if (!teacherId) return;

        try {
          const q = query(
            collection(firestore, "lessons"),
            where("teacherId", "==", teacherId)
          );
          const snapshot = await getDocs(q);

          const fetchedLessons = [];

          for (const docSnap of snapshot.docs) {
            let lesson = { id: docSnap.id, ...docSnap.data() };

            // ✅ Fetch Opposite User (Student) Details
            const studentDocRef = doc(firestore, "students", lesson.studentId);
            const studentSnap = await getDoc(studentDocRef);

            if (studentSnap.exists()) {
              lesson.oppositeUser = {
                id: studentSnap.id,
                name: studentSnap.data().name || "Unknown",
                profileImage: studentSnap.data().profileImage || "",
              };
            } else {
              lesson.oppositeUser = { name: "Unknown", profileImage: "" };
            }

            fetchedLessons.push({
              ...lesson,
              createdAt:
                lesson.createdAt instanceof Timestamp
                  ? lesson.createdAt.toDate().toISOString()
                  : lesson.createdAt,
            });
          }

          dispatch(setLessons(fetchedLessons)); // ✅ Now Redux-safe
        } catch (error) {
          console.error("❌ Error fetching lessons:", error);
        }
      };

      fetchLessons();
    }, [dispatch, teacherId])
  );

  // ✅ 3️⃣ Handle Balance Transfer
  const handleTransferToBank = () => {
    console.log("Transfer to bank account initiated");
  };

  return (
    <View style={styles.mainContainer}>
      <View
        style={{
          backgroundColor: "#fff",
          marginVertical: 10,
          borderRadius: 10,
          padding: 10,
        }}
      >
        <View style={styles.greetingRow}>
          {/* ✅ Show profile image if exists, otherwise show default image */}
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
      <View style={{ backgroundColor: "#fff", padding: 10, borderRadius: 10 }}>
        <View style={styles.commingLessonsCont}>
          <Text style={styles.comingLessonsText}>الدروس القادمة:</Text>
        </View>
        <WeeklyDateSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          availableSlots={lessons}
          type="lessons"
        />
        {/* List of lessons */}
        <LessonsCard
          lessons={lessons.filter(
            (lesson) => lesson.selectedDate === selectedDate
          )}
        />
      </View>
    </View>
  );
};
// account-cash-outline

//
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 15,
  },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commingLessonsCont: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  comingLessonsText: {
    textAlign: "right",
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
  greeting: {
    color: "#031417",
    fontSize: 16,
    marginBottom: 2,
    textAlign: "right",
    writingDirection: "rtl",
    fontFamily: "Cairo",
    fontWeight: "700",
  },

  header: {
    padding: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
  },
  balanceText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#031417",

    fontFamily: "Cairo",
  },
  transferButton: {
    backgroundColor: "#009dff",
    width: "100%",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  transferButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Cairo",
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
    borderWidth: 2,
  },
  subTitle: {
    fontSize: 13,
    color: "#009dff",
    marginBottom: 20,
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "normal",
    fontFamily: "Cairo",
  },
});

export default TeacherHomeScreen;

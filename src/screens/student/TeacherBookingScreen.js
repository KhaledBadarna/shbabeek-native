import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { onSnapshot, doc } from "firebase/firestore";

import { firestore } from "../../firebase";
import WeeklyDateSelector from "../../components/WeeklyDateSelector";
import SlotList from "../../components/SlotList";
import AuthModal from "../../components/modals/AuthModal";

const daysOfWeek = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const TeacherBookingScreen = ({ route, navigation }) => {
  const { teacher, teacherId, topicName } = route.params;
  const { isLoggedIn } = useSelector((state) => state.user);

  const [selectedDate, setSelectedDate] = useState(""); // "2025-03-18"
  const [availableSlots, setAvailableSlots] = useState([]);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);

  // 👂 Fetch live slot updates from Firestore
  useEffect(() => {
    if (!teacherId) return;

    const ref = doc(firestore, "teacher_availability", teacherId);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        const slotsObj = snapshot.data().slots || {};
        const allSlots = Object.entries(slotsObj).flatMap(([day, slots]) =>
          slots.map((slot) => ({ ...slot, day }))
        );
        setAvailableSlots(allSlots);
      }
    });

    return () => unsubscribe();
  }, [teacherId]);

  // 🧠 Convert selected ISO date to day name in Arabic
  const selectedDayName = daysOfWeek[new Date(selectedDate).getDay()];

  const slotsForDate = availableSlots.filter(
    (slot) => slot.day === selectedDayName && !slot.isBooked
  );

  const handleSlotPress = (slot) => {
    if (!isLoggedIn) {
      setRegisterModalVisible(true);
      return;
    }

    navigation.navigate("BookingScreen", {
      selectedSlot: slot,
      selectedDate,
      topicName,
      teacherId,
      teacher,
    });
  };

  return (
    <View style={styles.container}>
      <WeeklyDateSelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        availableSlots={availableSlots.filter((slot) => !slot.isBooked)} // ✅ only unbooked
        type="availability"
        startFromTomorrow={true}
      />

      <View style={styles.slotsContainer}>
        {slotsForDate.length > 0 ? (
          <SlotList slots={slotsForDate} onSlotPress={handleSlotPress} />
        ) : (
          <Text style={styles.noSlotsText}>
            لا توجد مواعيد متاحة لهذا اليوم
          </Text>
        )}
      </View>

      <AuthModal
        visible={registerModalVisible}
        onClose={() => setRegisterModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  slotsContainer: {
    flex: 1,
    marginTop: 10,
  },
  noSlotsText: {
    fontSize: 16,
    color: "#999",
    fontFamily: "Cairo",
    textAlign: "center",
    marginTop: 40,
  },
});

export default TeacherBookingScreen;

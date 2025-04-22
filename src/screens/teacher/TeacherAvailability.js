import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import WeeklyDateSelector from "../../components/WeeklyDateSelector";
import SlotList from "../../components/SlotList";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import { useSelector } from "react-redux";
import InfoModal from "../../components/modals/InfoModal";

const arabicDays = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const TeacherAvailability = () => {
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState({
    الأحد: [],
    الاثنين: [],
    الثلاثاء: [],
    الأربعاء: [],
    الخميس: [],
    الجمعة: [],
    السبت: [],
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isTimeValid, setIsTimeValid] = useState(true);
  const teacherId = useSelector((state) => state.user.userId);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoText, setInfoText] = useState("");
  useEffect(() => {
    if (!teacherId) return;

    const ref = doc(firestore, "teacher_availability", teacherId);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      console.log("🔥 onSnapshot triggered for availability");

      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log("🧠 snapshot data:", data);
        setSlots(data.slots || {});
      } else {
        console.log("❌ Document does not exist");
      }
    });

    return () => unsubscribe();
  }, [teacherId]);

  const saveChanges = async () => {
    try {
      const cleaned = { ...slots };
      delete cleaned[""];

      await setDoc(
        doc(firestore, "teacher_availability", teacherId),
        { slots: cleaned },
        { merge: true }
      );

      setHasChanges(false);
      console.log("✅ Saved availability");
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const validateTime = (t) => {
    const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!regex.test(t)) return false;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m >= 420;
  };

  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = (hours + 1) % 24;
    return `${String(endHours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const isTimeOverlapping = (start, end, existStart, existEnd) => {
    const toMins = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const s1 = toMins(start);
    const e1 = toMins(end);
    const s2 = toMins(existStart);
    const e2 = toMins(existEnd);

    return (
      (s1 >= s2 && s1 < e2) || (e1 > s2 && e1 <= e2) || (s1 <= s2 && e1 >= e2)
    );
  };

  const handleTimeChange = (input) => {
    let formatted = input.replace(/[^0-9]/g, "");
    if (formatted.length > 2) {
      formatted = formatted.slice(0, 2) + ":" + formatted.slice(2, 4);
    }
    setTime(formatted);
  };

  const addSlot = () => {
    if (!time || !validateTime(time)) {
      setInfoText("❌ لا يمكن إضافة أوقات بين 00:00 و 06:59.");
      setInfoVisible(true);
      return;
    }

    if (!selectedDate) {
      setInfoText("❌ يرجى اختيار يوم قبل إضافة وقت! ❌");
      setInfoVisible(true);

      return;
    }

    const dayName = arabicDays[new Date(selectedDate).getDay()];
    const startTime = time.trim();
    const endTime = calculateEndTime(startTime);

    const existing = slots[dayName] || [];
    const isOverlap = existing.some((slot) =>
      isTimeOverlapping(startTime, endTime, slot.startTime, slot.endTime)
    );

    if (isOverlap) {
      setInfoText("❌ الوقت يتداخل مع وقت آخر، الرجاء اختيار وقت آخر.");
      setInfoVisible(true);
      return;
    }

    const newSlot = {
      id: Date.now().toString(),
      startTime,
      endTime,
      isBooked: false,
    };

    setSlots((prev) => ({
      ...prev,
      [dayName]: [...(prev[dayName] || []), newSlot].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      ),
    }));

    setHasChanges(true);
    setTime("");
  };

  const removeSlot = (slotId) => {
    const updated = { ...slots };
    for (const day in updated) {
      updated[day] = updated[day].filter((s) => s.id !== slotId);
    }
    setSlots(updated);
    setHasChanges(true);
  };

  const currentDayName = selectedDate
    ? arabicDays[new Date(selectedDate).getDay()]
    : "";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <WeeklyDateSelector
          type="availability"
          startFromTomorrow={true} // 👈 hide today
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          availableSlots={Object.entries(slots).flatMap(([day, arr]) =>
            arr.map((slot) => ({ ...slot, day }))
          )}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.addButton} onPress={addSlot}>
            <Text style={styles.addButtonText}>إضافة الوقت</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, !isTimeValid && styles.invalidInput]}
            placeholder="الوقت (مثال: 10:00)"
            value={time}
            onChangeText={handleTimeChange}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>

        <SlotList
          slots={slots[currentDayName] || []}
          onSlotPress={(slot) => removeSlot(slot.id)}
        />

        <View style={{ paddingHorizontal: 10, backgroundColor: "#efefef" }}>
          <Text style={styles.footerNote}>
            * بعد تعبئة جميع الايام، اضغط حفظ
          </Text>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: hasChanges ? "#009dff" : "#898989",
                opacity: hasChanges ? 1 : 0.5,
              },
            ]}
            disabled={!hasChanges}
            onPress={saveChanges}
          >
            <Text style={styles.saveButtonText}>حفظ</Text>
          </TouchableOpacity>
        </View>
      </View>
      <InfoModal
        isVisible={infoVisible}
        onClose={() => setInfoVisible(false)}
        message={infoText}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "40%",
    fontFamily: "Cairo",
    textAlign: "right",
    backgroundColor: "#ffff",
  },
  invalidInput: {
    borderColor: "red",
  },
  addButton: {
    backgroundColor: "#009dff",
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Cairo",
  },
  saveButton: {
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: "Cairo",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerNote: {
    fontFamily: "Cairo",
    color: "#031417",
    fontSize: 10,
    textAlign: "center",
  },
});

export default TeacherAvailability;

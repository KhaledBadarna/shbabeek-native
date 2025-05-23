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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const arabicDays = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const ManageAvailabilityScreen = () => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slots, setSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const barberId = useSelector((state) => state.user.userId);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoText, setInfoText] = useState("");

  useEffect(() => {
    if (!barberId) return;

    const ref = doc(firestore, "barber_availability", barberId);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSlots(data.slots || {});
      }
    });

    return () => unsubscribe();
  }, [barberId]);

  const saveChanges = async () => {
    try {
      await setDoc(
        doc(firestore, "barber_availability", barberId),
        { slots },
        { merge: true }
      );
      setHasChanges(false);
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const validateTimeFormat = (t) =>
    /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.test(t);

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const formatTimeInput = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
    if (digitsOnly.length >= 3) {
      return `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2)}`;
    }
    return digitsOnly;
  };

  const addSlot = () => {
    if (!selectedDate) {
      setInfoText("❌ يرجى اختيار يوم قبل إضافة وقت!");
      setInfoVisible(true);
      return;
    }

    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      setInfoText("❌ الوقت غير صالح. أدخل بصيغة HH:MM");
      setInfoVisible(true);
      return;
    }

    const dayName = arabicDays[new Date(selectedDate).getDay()];
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    if (start >= end) {
      setInfoText("❌ وقت الإغلاق يجب أن يكون بعد وقت الفتح");
      setInfoVisible(true);
      return;
    }

    const newSlot = {
      id: Date.now().toString(),
      startTime,
      endTime,
      isBooked: false,
    };

    const existing = slots[dayName] || [];
    const overlap = existing.some((s) => {
      const sStart = toMinutes(s.startTime);
      const sEnd = toMinutes(s.endTime);
      return start < sEnd && end > sStart;
    });

    if (overlap) {
      setInfoText("❌ الوقت يتداخل مع وقت آخر.");
      setInfoVisible(true);
      return;
    }

    setSlots((prev) => ({
      ...prev,
      [dayName]: [...existing, newSlot].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      ),
    }));

    setHasChanges(true);
    setStartTime("");
    setEndTime("");
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
          startFromTomorrow={true}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          availableSlots={Object.entries(slots).flatMap(([day, arr]) =>
            arr.map((slot) => ({ ...slot, day }))
          )}
        />

        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            placeholder="وقت الفتح (مثال: 10:00)"
            value={startTime}
            onChangeText={(text) => setStartTime(formatTimeInput(text))}
            keyboardType="numeric"
            maxLength={5}
          />

          <TextInput
            style={styles.input}
            placeholder="وقت الإغلاق (مثال: 14:00)"
            value={endTime}
            onChangeText={(text) => setEndTime(formatTimeInput(text))}
            keyboardType="numeric"
            maxLength={5}
          />

          <TouchableOpacity style={styles.addButton} onPress={addSlot}>
            <Icon name="plus-circle" size={36} color="#009dff" />
          </TouchableOpacity>
        </View>

        <SlotList
          slots={slots[currentDayName] || []}
          selectedSlots={[]} // prevent crashing
          onSlotPress={(slot) => removeSlot(slot.id)}
        />
      </View>

      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: hasChanges ? "#009dff" : "#898989" },
          ]}
          disabled={!hasChanges}
          onPress={saveChanges}
        >
          <Text style={styles.saveButtonText}>حفظ</Text>
        </TouchableOpacity>
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
    padding: 15,
    backgroundColor: "#fff",
    flex: 1,
  },
  inputSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 20,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontFamily: "Cairo",
    backgroundColor: "#fff",
    textAlign: "center",
    width: "40%",
  },
  addButton: {
    alignSelf: "center",
    marginTop: 6,
  },
  saveButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: "Cairo",
    fontSize: 16,
    fontWeight: "bold",
  },
  stickyFooter: {
    backgroundColor: "#fff",
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});

export default ManageAvailabilityScreen;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { onSnapshot, doc, getDoc } from "firebase/firestore";

import { firestore } from "../../firebase";
import WeeklyDateSelector from "../../components/WeeklyDateSelector";
import SlotList from "../../components/SlotList";
import AuthModal from "../../components/modals/AuthModal";

import {
  groupSlotsByTimePeriod,
  getIconForPeriod,
} from "../../utils/slotHelpers";
import InfoModal from "../../components/modals/InfoModal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
const daysOfWeek = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
import { generateSmartSlots } from "../../utils/generateSmartSlots";

const getArabicDayName = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);

  // Always create the date in local time (not UTC)
  const localDate = new Date(year, month - 1, day, 12); // 12:00 PM avoids UTC shifts
  const dayIndex = localDate.getDay();

  const days = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  return days[dayIndex];
};

const serviceKeyMap = {
  راس: "hair",
  ذقن: "beard",
  أطفال: "kids",
  "رأس وذقن": "both",
};

const BarberAvailabilityScreen = ({ route, navigation }) => {
  const { barber, barberId } = route.params;
  const { isLoggedIn } = useSelector((state) => state.user);
  const [infoVisible, setInfoVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);

  useEffect(() => {
    if (!barberId) return;

    const ref = doc(firestore, "barber_availability", barberId);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        const slotsObj = snapshot.data().slots || {};
        const allSlots = Object.entries(slotsObj).flatMap(([day, slots]) =>
          slots.map((slot, index) => ({
            ...slot,
            day,
            id: `${day}-${slot.startTime}-${slot.endTime}-${index}`,
          }))
        );
        setAvailableSlots(allSlots);
      }
    });

    return () => unsubscribe();
  }, [barberId]);

  const [year, month, day] = selectedDate.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  const selectedDayName = getArabicDayName(selectedDate);
  const sameDaySlots = availableSlots.filter((s) => s.day === selectedDayName);

  const userSelectedBookings = selectedSlots
    .filter((s) => s.day === selectedDayName)
    .map((s) => [s.startTime, s.endTime]);

  const existingBookings = sameDaySlots
    .filter((s) => s.isBooked)
    .map((s) => [s.startTime, s.endTime]);

  const workingPeriods = [];
  const unbooked = sameDaySlots.filter((s) => !s.isBooked);

  if (unbooked.length > 0) {
    const sortedByTime = [...unbooked].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
    const start = sortedByTime[0].startTime;
    const end = sortedByTime[sortedByTime.length - 1].endTime;
    workingPeriods.push([start, end]);
  }

  const key = serviceKeyMap[selectedService];
  const duration =
    barber?.durations?.[key] !== undefined ? barber.durations[key] : 30;

  const smartSlots = generateSmartSlots(
    workingPeriods,
    existingBookings,
    duration
  );

  const rawSlotsForDate = smartSlots.map((s, index) => ({
    ...s,
    isBooked: false,
    day: selectedDayName,
    selectedDate: selectedDate, // ✅ ensure selectedDate is passed with each slot
    serviceType: selectedService,
    id: `${selectedDate}-${s.startTime}-${s.endTime}-${index}`,
  }));

  const groupedSlots = groupSlotsByTimePeriod(rawSlotsForDate || []);

  const handleSlotPress = (newSlot) => {
    const isSelected = selectedSlots.some(
      (s) =>
        s.startTime === newSlot.startTime &&
        s.endTime === newSlot.endTime &&
        s.selectedDate === newSlot.selectedDate
    );

    if (isSelected) {
      setSelectedSlots((prev) =>
        prev.filter(
          (s) =>
            !(
              s.startTime === newSlot.startTime &&
              s.endTime === newSlot.endTime &&
              s.selectedDate === newSlot.selectedDate
            )
        )
      );
      return;
    }

    const newStart = parseTime(newSlot.startTime);
    const newEnd = parseTime(newSlot.endTime);

    const hasConflict = selectedSlots.some((slot) => {
      if (slot.selectedDate !== newSlot.selectedDate) return false;
      const start = parseTime(slot.startTime);
      const end = parseTime(slot.endTime);
      return !(newEnd <= start || newStart >= end);
    });

    if (hasConflict) {
      setInfoVisible(true);
      return;
    }

    setSelectedSlots((prev) => [...prev, newSlot]);
  };

  const parseTime = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const services = ["راس", "ذقن", "أطفال", "رأس وذقن"];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        style={styles.container}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.servicesBar}
          contentContainerStyle={styles.servicesContent}
        >
          {services.map((service) => (
            <TouchableOpacity
              key={service}
              style={[
                styles.serviceBtn,
                selectedService === service && styles.serviceBtnSelected,
              ]}
              onPress={() => setSelectedService(service)}
            >
              <Text
                style={[
                  styles.serviceText,
                  selectedService === service && styles.serviceTextSelected,
                ]}
              >
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <WeeklyDateSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          availableSlots={availableSlots.filter((slot) => !slot.isBooked)}
          type="availability"
          startFromTomorrow={true}
        />

        <View style={styles.slotsContainer}>
          {selectedService &&
          Object.values(groupedSlots).some((arr) => arr.length > 0) ? (
            Object.entries(groupedSlots).map(([period, slots]) =>
              slots.length > 0 ? (
                <View key={period}>
                  <View style={styles.periodLabelRow}>
                    <Icon
                      name={getIconForPeriod(period)}
                      size={18}
                      color="#031417"
                      style={{ marginRight: 5 }}
                    />
                    <Text style={styles.periodLabel}>{period}</Text>
                  </View>
                  <SlotList
                    slots={slots}
                    selectedSlots={selectedSlots}
                    onSlotPress={handleSlotPress}
                  />
                </View>
              ) : null
            )
          ) : (
            <Text style={styles.noSlotsText}>
              {selectedService
                ? "لا توجد مواعيد متاحة لهذا اليوم"
                : "يرجى اختيار نوع الخدمة لعرض الأوقات المتاحة"}
            </Text>
          )}
        </View>

        <AuthModal
          visible={registerModalVisible}
          onClose={() => setRegisterModalVisible(false)}
        />
      </ScrollView>

      {selectedSlots.length > 0 && (
        <View style={styles.fixedButtonWrapper}>
          <TouchableOpacity
            style={styles.bookNowButton}
            onPress={async () => {
              if (!isLoggedIn) {
                setRegisterModalVisible(true);
                return;
              }

              const ref = doc(firestore, "barbers", barberId);
              const snap = await getDoc(ref);

              if (snap.exists()) {
                const fullBarberData = { id: snap.id, ...snap.data() };
                const isoDate = selectedSlots[0]?.selectedDate || selectedDate;
                const dayName = getArabicDayName(isoDate);
                navigation.navigate("BookingScreen", {
                  selectedSlots,
                  selectedDate: isoDate,
                  dayName,
                  barberId,
                  barber: fullBarberData,
                });
              }
            }}
          >
            <Text style={styles.bookNowText}>
              إتمام الحجز ({selectedSlots.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <InfoModal
        isVisible={infoVisible}
        onClose={() => setInfoVisible(false)}
        message={"لا يمكنك اختيار وقتين متداخلين"}
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
  servicesBar: {
    marginBottom: 10,
  },
  serviceBtn: {
    paddingHorizontal: 14,
    height: 44,
    justifyContent: "center",
    backgroundColor: "#eee",
    borderRadius: 20,
    marginHorizontal: 5,
  },
  serviceBtnSelected: {
    backgroundColor: "#009dff",
  },
  serviceText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#555",
  },
  serviceTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  slotsContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  noSlotsText: {
    fontSize: 16,
    color: "#999",
    fontFamily: "Cairo",
    textAlign: "center",
    marginTop: 40,
  },
  periodLabel: {
    fontSize: 16,
    marginVertical: 10,
    fontFamily: "Cairo",
    color: "#031417",
  },
  servicesContent: {
    alignItems: "center",
    paddingHorizontal: 5,
  },
  periodLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    justifyContent: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  fixedButtonWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingBottom: 25,
    paddingTop: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 5,
  },
  bookNowButton: {
    backgroundColor: "#0c2230",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bookNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Cairo",
  },
});

export default BarberAvailabilityScreen;

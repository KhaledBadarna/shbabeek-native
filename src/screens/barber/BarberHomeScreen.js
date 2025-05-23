import React, { useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import { setLessons } from "../../redux/slices/appointmentsSlice";
import AppointmentsCard from "../../components/AppointmentsCard";
import WeeklyDateSelector from "../../components/WeeklyDateSelector";
import { Timestamp } from "firebase/firestore";

const BarberHomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [hasAvailability, setHasAvailability] = useState(false);
  const [bookingDisabledFrom, setBookingDisabledFrom] = useState(null);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const appointments = useSelector((state) => state.appointments);
  const barberData = useSelector((state) => state.barber);
  const { userId: barberId } = useSelector((state) => state.user);

  useEffect(() => {
    if (!barberId) return;
    const q = query(
      collection(firestore, "appointments"),
      where("barberId", "==", barberId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const updatedLessons = [];
      for (const docSnap of snapshot.docs) {
        let appointment = { id: docSnap.id, ...docSnap.data() };
        const clientDocRef = doc(firestore, "clients", appointment.clientId);
        const clientSnap = await getDoc(clientDocRef);
        appointment.oppositeUser = clientSnap.exists()
          ? {
              id: clientSnap.id,
              name: clientSnap.data().name || "Unknown",
              profileImage: clientSnap.data().profileImage || "",
            }
          : { name: "Unknown", profileImage: "" };

        updatedLessons.push({
          ...appointment,
          createdAt:
            appointment.createdAt instanceof Timestamp
              ? appointment.createdAt.toDate().toISOString()
              : appointment.createdAt,
          endedAt:
            appointment.endedAt instanceof Timestamp
              ? appointment.endedAt.toDate().toISOString()
              : appointment.endedAt,
        });
      }
      dispatch(setLessons(updatedLessons));
    });

    return () => unsubscribe();
  }, [barberId]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!barberId) return;
        try {
          const barberRef = doc(firestore, "barbers", barberId);
          const barberSnap = await getDoc(barberRef);
          if (barberSnap.exists()) {
            setBookingDisabledFrom(
              barberSnap.data().bookingDisabledFrom || null
            );
          }

          const availabilityRef = doc(
            firestore,
            "barber_availability",
            barberId
          );
          const availabilitySnap = await getDoc(availabilityRef);
          if (availabilitySnap.exists()) {
            const slots = Object.values(
              availabilitySnap.data().slots || {}
            ).flat();
            setHasAvailability(slots.length > 0);
          } else {
            setHasAvailability(false);
          }
        } catch (err) {
          console.error("❌ Error:", err);
        }
      };
      fetchData();
    }, [dispatch, barberId])
  );

  const toggleBooking = async (type) => {
    const newValue = bookingDisabledFrom === type ? null : type;
    await updateDoc(doc(firestore, "barbers", barberId), {
      bookingDisabledFrom: newValue,
    });
    setBookingDisabledFrom(newValue);
  };

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

  const hasLessonsThisWeek = appointments.some((a) =>
    currentWeekDates.includes(a.selectedDate)
  );

  return (
    <View style={styles.container}>
      {/* Toggle Booking Options */}
      <View style={styles.headerCard}>
        <Text style={styles.toggleTitle}>
          التوقف عن استقبال حجوزات جديدة ابتداءا من:
        </Text>
        <View style={styles.toggleOptions}>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              bookingDisabledFrom === "today" && styles.toggleOptionActive,
            ]}
            onPress={() => toggleBooking("today")}
          >
            <Text style={styles.toggleOptionText}>الآن</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              bookingDisabledFrom === "nextWeek" && styles.toggleOptionActive,
            ]}
            onPress={() => toggleBooking("nextWeek")}
          >
            <Text style={styles.toggleOptionText}>الأسبوع القادم</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الحجوزات القادمة</Text>
        <WeeklyDateSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          availableSlots={appointments.filter((a) => !a.isAppointmentCompleted)}
          type="appointments"
        />
        <AppointmentsCard
          appointments={appointments
            .filter(
              (a) =>
                a.selectedDate === selectedDate && !a.isAppointmentCompleted
            )
            .sort((a, b) => {
              const toMin = (t) => {
                const [h, m] = t.split(":").map(Number);
                return h * 60 + m;
              };
              return toMin(a.startTime) - toMin(b.startTime);
            })}
        />
      </View>

      {/* Alerts */}
      {!hasLessonsThisWeek && (
        <View style={styles.alertBox}>
          {!barberData?.services ? (
            <>
              <Text style={styles.alertText}>
                لم تقم بعد بإدخال معلوماتك الشخصية!
              </Text>
              <TouchableOpacity
                style={styles.alertBtn}
                onPress={() => navigation.navigate("BarberSettingsScreen")}
              >
                <Text style={styles.alertBtnText}>أكمل معلوماتك</Text>
              </TouchableOpacity>
            </>
          ) : !hasAvailability ? (
            <>
              <Text style={styles.alertText}>
                لم تضف أوقاتاً متاحة للحجز. أضف أوقات وابدأ العمل الآن!
              </Text>
              <TouchableOpacity
                style={styles.alertBtn}
                onPress={() => navigation.navigate("ManageAvailabilityScreen")}
              >
                <Text style={styles.alertBtnText}>إضافة أوقات</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f7", padding: 15 },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  toggleTitle: {
    fontFamily: "Cairo",
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#031417",
    textAlign: "right",
  },
  toggleOptions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  toggleOption: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#f7f7f7",
  },
  toggleOptionActive: {
    backgroundColor: "#ff4d4d",
    borderColor: "#ff4d4d",
  },
  toggleOptionText: {
    fontFamily: "Cairo",
    fontSize: 13,
    color: "#031417",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: "Cairo",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "right",
    color: "#031417",
  },
  alertBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  alertText: {
    fontFamily: "Cairo",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    color: "#031417",
  },
  alertBtn: {
    backgroundColor: "#009dff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  alertBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Cairo",
  },
});

export default BarberHomeScreen;

import { scheduleLessonNotification } from "./notifications/scheduleLessonNotification.js";
import { checkStudentBookingConflict } from "./checkBookingConflict.js";
import { firestore } from "../firebase.js";
import { addLesson } from "../redux/slices/appointmentsSlice.js";
import { serverTimestamp } from "firebase/firestore";
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";

export const handleAppointmentBooking = async (
  barber,
  barberId,
  selectedSlots, // ✅ now accepts array
  selectedDate,
  clientId,
  serviceType,
  dispatch,
  baseId,
  totalPrice,
  defaultPaymentMethod
) => {
  const normalizeService = (label) => {
    const map = {
      راس: "hair",
      رأس: "hair",
      ذقن: "beard",
      أطفال: "kids",
      "راس وذقن": "both",
      "رأس وذقن": "both",
    };
    return map[label?.trim()] || null;
  };

  try {
    for (let index = 0; index < selectedSlots.length; index++) {
      const slot = selectedSlots[index];
      const serviceKey = normalizeService(slot.serviceType);
      const conflict = await checkStudentBookingConflict(
        clientId,
        slot.selectedDate,
        slot.startTime,
        slot.endTime
      );

      if (conflict) {
        console.log("⛔️ Conflict at", slot.startTime);
        return { success: false, reason: "conflict" };
      }

      const appointmentId = `${baseId}_${index}`;

      const baseAppointmentData = {
        barberId,
        clientId,
        selectedDate: slot.selectedDate,
        serviceType: slot.serviceType,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAppointmentCompleted: false,
        isPaid: defaultPaymentMethod !== "Cash",
        price: barber.services?.[serviceKey] ?? 0,
      };

      const firestoreAppointmentData = {
        ...baseAppointmentData,
        createdAt: serverTimestamp(),
      };

      await setDoc(
        doc(firestore, "appointments", appointmentId),
        firestoreAppointmentData
      );

      dispatch(
        addLesson({
          id: appointmentId,
          ...baseAppointmentData,
          createdAt: Date.now(),
          oppositeUser: {
            id: barberId,
            name: barber.name || "Unknown",
            profileImage: barber.profileImage || "",
          },
        })
      );

      // Set the availability slot to isBooked
      const barberAvailabilityRef = doc(
        firestore,
        "barber_availability",
        barberId
      );
      const barberAvailabilityDoc = await getDoc(barberAvailabilityRef);

      if (barberAvailabilityDoc.exists()) {
        const availabilityData = barberAvailabilityDoc.data();
        const updatedSlots = { ...availabilityData.slots };

        if (updatedSlots[slot.day]) {
          updatedSlots[slot.day] = updatedSlots[slot.day].map((s) =>
            s.startTime === slot.startTime && s.endTime === slot.endTime
              ? { ...s, isBooked: true, date: selectedDate }
              : s
          );
        }

        await updateDoc(barberAvailabilityRef, { slots: updatedSlots });
      }

      // Link the appointment to both client and barber
      await Promise.all([
        updateDoc(doc(firestore, "bookings", clientId), {
          appointmentIds: arrayUnion(appointmentId),
        }).catch(() =>
          setDoc(doc(firestore, "bookings", clientId), {
            appointmentIds: [appointmentId],
          })
        ),
        updateDoc(doc(firestore, "bookings", barberId), {
          appointmentIds: arrayUnion(appointmentId),
        }).catch(() =>
          setDoc(doc(firestore, "bookings", barberId), {
            appointmentIds: [appointmentId],
          })
        ),
      ]);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error booking appointment:", error);
    throw new Error("Error booking appointment, please try again.");
  }
};

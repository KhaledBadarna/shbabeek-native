import { scheduleLessonNotification } from "../utils/notifications/scheduleLessonNotification";
import { checkStudentBookingConflict } from "../utils/checkBookingConflict.js";
import { firestore } from "../firebase";
import { addLesson } from "../redux/slices/lessonsSlice";
import { serverTimestamp } from "firebase/firestore";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
export const handleBooking = async (
  teacher,
  teacherId,
  selectedSlot,
  selectedDate,
  studentId,
  file,
  selectedTopic,
  dispatch
) => {
  const isTesting = true; // 🔥 خليها true للتجربة

  try {
    const conflict = await checkStudentBookingConflict(
      studentId,
      selectedDate,
      selectedSlot.startTime,
      selectedSlot.endTime
    );

    if (conflict) {
      console.log("⛔️ Time conflict found — blocking booking");
      return { success: false, reason: "conflict" };
    }

    const fileUrl = file ? await uploadFile(file) : null;

    const baseLessonData = {
      teacherId,
      studentId,
      selectedDate,
      selectedTopic,
      day: selectedSlot.day,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      fileUrl,
      isLessonCompleted: false,
      paidAmount: teacher.pricePerHour,
      isTeacherPaidOut: false,
    };

    const firestoreLessonData = {
      ...baseLessonData,
      createdAt: serverTimestamp(),
    };

    const lessonRef = await addDoc(
      collection(firestore, "lessons"),
      firestoreLessonData
    );
    const lessonId = lessonRef.id;

    const reduxLessonData = {
      ...baseLessonData,
      createdAt: Date.now(),
    };

    dispatch(
      addLesson({
        id: lessonId,
        ...reduxLessonData,
        oppositeUser: {
          id: teacherId,
          name: teacher.name || "Unknown",
          profileImage: teacher.profileImage || "",
        },
      })
    );

    const studentDoc = await getDoc(doc(firestore, "students", studentId));
    const teacherDoc = await getDoc(doc(firestore, "teachers", teacherId));

    const studentPushToken = studentDoc.exists()
      ? studentDoc.data().pushToken
      : null;
    const teacherPushToken = teacherDoc.exists()
      ? teacherDoc.data().pushToken
      : null;

    if (studentPushToken) {
      await scheduleLessonNotification(
        studentPushToken,
        notifyDate,
        notifyStartTime,
        "📚 لا تنسَ الدرس",
        "⏳ درسك سيبدأ بعد 10 دقائق!"
      );
    }

    if (teacherPushToken) {
      await scheduleLessonNotification(
        teacherPushToken,
        notifyDate,
        notifyStartTime,
        "📚 درس قادم",
        "🧑‍🏫 لديك درس سيبدأ بعد 10 دقائق!"
      );
    }

    // ✅ Update student booking
    const studentBookingRef = doc(firestore, "bookings", studentId);
    const studentBookingDoc = await getDoc(studentBookingRef);
    if (studentBookingDoc.exists()) {
      await updateDoc(studentBookingRef, { lessonIds: arrayUnion(lessonId) });
    } else {
      await setDoc(studentBookingRef, { lessonIds: [lessonId] });
    }

    // ✅ Update teacher booking
    const teacherBookingRef = doc(firestore, "bookings", teacherId);
    const teacherBookingDoc = await getDoc(teacherBookingRef);
    if (teacherBookingDoc.exists()) {
      await updateDoc(teacherBookingRef, { lessonIds: arrayUnion(lessonId) });
    } else {
      await setDoc(teacherBookingRef, { lessonIds: [lessonId] });
    }

    // ✅ Update teacher availability
    const teacherAvailabilityRef = doc(
      firestore,
      "teacher_availability",
      teacherId
    );
    const teacherAvailabilityDoc = await getDoc(teacherAvailabilityRef);

    if (teacherAvailabilityDoc.exists()) {
      const availabilityData = teacherAvailabilityDoc.data();
      const updatedSlots = { ...availabilityData.slots };

      if (updatedSlots[selectedSlot.day]) {
        updatedSlots[selectedSlot.day] = updatedSlots[selectedSlot.day].map(
          (slot) => {
            if (
              slot.startTime === selectedSlot.startTime &&
              slot.endTime === selectedSlot.endTime
            ) {
              return {
                ...slot,
                isBooked: true,
                date: selectedDate,
              };
            }
            return slot;
          }
        );
      }

      await updateDoc(teacherAvailabilityRef, { slots: updatedSlots });
      console.log("✅ Slot updated to 'booked'");
    }
  } catch (error) {
    console.error("❌ Error booking lesson:", error);
    throw new Error("Error booking lesson, please try again.");
  }

  return { success: true };
};

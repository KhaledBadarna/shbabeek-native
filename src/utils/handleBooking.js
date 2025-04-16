import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { uploadFile } from "./uploadFile";
import { addLesson } from "../redux/slices/lessonsSlice"; // ✅ Import Redux action
import { checkStudentBookingConflict } from "./checkBookingConflict";

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
  try {
    // 🧠 ⛔️ Check for conflicts BEFORE doing anything else
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

    // Upload file if available
    const fileUrl = file ? await uploadFile(file) : null;

    // ✅ Base lesson data (without timestamps)
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

    // ✅ Step 1: Add lesson to Firestore
    const firestoreLessonData = {
      ...baseLessonData,
      createdAt: serverTimestamp(), // ✅ Firestore only
    };

    const lessonRef = await addDoc(
      collection(firestore, "lessons"),
      firestoreLessonData
    );
    const lessonId = lessonRef.id;

    // ✅ Step 2: Dispatch to Redux (no serverTimestamp here!)
    const reduxLessonData = {
      ...baseLessonData, // ✅ this is the correct object name
      createdAt: Date.now(), // ✅ use serializable timestamp
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

    // ✅ Step 3: Update student booking history
    const studentBookingRef = doc(firestore, "bookings", studentId);
    const studentBookingDoc = await getDoc(studentBookingRef);
    if (studentBookingDoc.exists()) {
      await updateDoc(studentBookingRef, { lessonIds: arrayUnion(lessonId) });
    } else {
      await setDoc(studentBookingRef, { lessonIds: [lessonId] });
    }

    // ✅ Step 4: Update teacher booking history
    const teacherBookingRef = doc(firestore, "bookings", teacherId);
    const teacherBookingDoc = await getDoc(teacherBookingRef);
    if (teacherBookingDoc.exists()) {
      await updateDoc(teacherBookingRef, { lessonIds: arrayUnion(lessonId) });
    } else {
      await setDoc(teacherBookingRef, { lessonIds: [lessonId] });
    }

    // ✅ Step 5: Update teacher availability slot
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
      console.log("✅ Slot successfully updated to 'booked'!");
    }
  } catch (error) {
    console.error("❌ Error booking lesson:", error);
    throw new Error("Error booking lesson, please try again.");
  }

  return { success: true };
};

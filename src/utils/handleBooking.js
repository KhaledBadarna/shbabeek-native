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
// import { uploadFile } from "./uploadFile";
import { addLesson } from "../redux/slices/lessonsSlice"; // ✅ Import Redux action

export const handleBooking = async (
  teacher,
  teacherId,
  selectedSlot,
  selectedDate,
  studentId,
  message,
  file,
  selectedTopic,
  dispatch
) => {
  try {
    // Upload file if available
    const fileUrl = file ? await uploadFile(file) : null;

    // Prepare lesson data
    const lessonData = {
      teacherId,
      studentId,
      selectedDate,
      selectedTopic,
      day: selectedSlot.day,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      message,
      fileUrl,
      isComplete: false, // ✅ Track completion status
      createdAt: serverTimestamp(),
    };

    // ✅ **Step 1: Add lesson to Firestore**
    const lessonRef = await addDoc(
      collection(firestore, "lessons"),
      lessonData
    );
    const lessonId = lessonRef.id;

    // ✅ **Step 2: Dispatch to Redux (before updating other collections)**
    dispatch(
      addLesson({
        id: lessonId,
        ...lessonData,
        oppositeUser: {
          id: teacherId, // ✅ Teacher ID
          name: teacher.name || "Unknown", // ✅ Teacher's Name
          profileImage: teacher.profileImage || "", // ✅ Teacher's Profile Image
        },
      })
    );

    // ✅ **Step 3: Update student booking history**
    const studentBookingRef = doc(firestore, "bookings", studentId);
    const studentBookingDoc = await getDoc(studentBookingRef);
    if (studentBookingDoc.exists()) {
      await updateDoc(studentBookingRef, { lessonIds: arrayUnion(lessonId) });
    } else {
      await setDoc(studentBookingRef, { lessonIds: [lessonId] });
    }

    // ✅ **Step 4: Update teacher booking history**
    const teacherBookingRef = doc(firestore, "bookings", teacherId);
    const teacherBookingDoc = await getDoc(teacherBookingRef);
    if (teacherBookingDoc.exists()) {
      await updateDoc(teacherBookingRef, { lessonIds: arrayUnion(lessonId) });
    } else {
      await setDoc(teacherBookingRef, { lessonIds: [lessonId] });
    }

    // ✅ **Step 5: Update teacher's availability slots**
    const teacherAvailabilityRef = doc(
      firestore,
      "teacher_availability",
      teacherId
    );
    const teacherAvailabilityDoc = await getDoc(teacherAvailabilityRef);

    if (teacherAvailabilityDoc.exists()) {
      const availabilityData = teacherAvailabilityDoc.data();
      const updatedSlots = { ...availabilityData.slots };

      // ✅ Modify only the selected slot
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
                date: selectedDate, // ✅ Add selectedDate to the slot
              }; // ✅ Mark as booked
            }
            return slot;
          }
        );
      }

      // ✅ Update Firestore with the new slots
      await updateDoc(teacherAvailabilityRef, { slots: updatedSlots });
      console.log("✅ Slot successfully updated to 'booked'!");
    }
  } catch (error) {
    console.error("❌ Error booking lesson:", error);
    throw new Error("Error booking lesson, please try again.");
  }
};

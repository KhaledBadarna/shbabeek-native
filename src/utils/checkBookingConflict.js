import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";

// Helper function to compare time ranges
const isTimeOverlap = (start1, end1, start2, end2) => {
  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  return s1 < e2 && s2 < e1;
};

export const checkStudentBookingConflict = async (
  studentId,
  selectedDate,
  startTime,
  endTime
) => {
  const lessonsRef = collection(firestore, "lessons");
  const q = query(
    lessonsRef,
    where("studentId", "==", studentId),
    where("selectedDate", "==", selectedDate)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.some((doc) => {
    const existing = doc.data();
    return isTimeOverlap(
      startTime,
      endTime,
      existing.startTime,
      existing.endTime
    );
  });
};

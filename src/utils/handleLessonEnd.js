import { doc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "../firebase"; // ✅ adjust your path

const handleLessonEnd = async (lessonId, teacherId, paidAmount, rating) => {
  try {
    // ✅ 1. Mark the lesson as completed
    await updateDoc(doc(firestore, "lessons", lessonId), {
      isLessonCompleted: true,
    });

    // ✅ 2. Update teacher stats
    const teacherRef = doc(firestore, "teachers", teacherId);
    const updatePayload = {
      lessonsCount: increment(1),
      pendingPayout: increment(paidAmount),
    };

    // ✅ 3. If student rated, update rating stats
    if (rating > 0) {
      updatePayload.ratingCount = increment(1);
      updatePayload.ratingSum = increment(rating);
    }

    await updateDoc(teacherRef, updatePayload);

    console.log("✅ Lesson completed and teacher stats updated.");
  } catch (error) {
    console.error("❌ Error in handleLessonEnd:", error);
    throw new Error("Something went wrong while completing the lesson.");
  }
};
export default handleLessonEnd;

import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "../firebase";

const handleLessonEnd = async (lessonId, teacherId, paidAmount, rating) => {
  try {
    // ✅ 1. Mark the lesson as completed
    await updateDoc(doc(firestore, "lessons", lessonId), {
      isLessonCompleted: true,
    });

    // ✅ 2. Calculate teacher's net earnings
    const teacherNetAmount = Math.round(paidAmount * 0.93);

    // ✅ 3. Prepare update payload
    const updatePayload = {
      lessonsCount: increment(1),
      pendingPayout: increment(teacherNetAmount),
    };

    // ✅ 4. If rating is given, update rating stats
    if (rating > 0) {
      updatePayload.ratingCount = increment(1);
      updatePayload.ratingSum = increment(rating);

      const teacherRef = doc(firestore, "teachers", teacherId);
      const teacherSnap = await getDoc(teacherRef);
      if (teacherSnap.exists()) {
        const { ratingSum = 0, ratingCount = 0 } = teacherSnap.data();
        const newSum = ratingSum + rating;
        const newCount = ratingCount + 1;
        updatePayload.rating = parseFloat((newSum / newCount).toFixed(1));
      }
    }

    // ✅ 5. Apply updates
    await updateDoc(doc(firestore, "teachers", teacherId), updatePayload);

    console.log("✅ Lesson completed and teacher stats updated.");
  } catch (error) {
    console.error("❌ Error in handleLessonEnd:", error);
    throw new Error("Something went wrong while completing the lesson.");
  }
};

export default handleLessonEnd;

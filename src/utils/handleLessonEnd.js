import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { serverTimestamp } from "firebase/firestore";
import { increment } from "firebase/firestore";
const handleLessonEnd = async (
  lessonId,
  teacherId,
  paidAmount,
  rating,
  userType
) => {
  try {
    const lessonRef = doc(firestore, "lessons", lessonId);
    const lessonSnap = await getDoc(lessonRef);
    if (!lessonSnap.exists()) return;

    const lessonData = lessonSnap.data();
    const alreadyCompleted = lessonData?.isLessonCompleted;

    // ✅ Only teacher marks complete
    if (userType === "teacher" && !alreadyCompleted) {
      await updateDoc(lessonRef, {
        isLessonCompleted: true,
        endedBy: teacherId,
        endedAt: serverTimestamp(),
      });

      const netAmount = Math.round(paidAmount * 0.93);

      await updateDoc(doc(firestore, "teachers", teacherId), {
        lessonsCount: increment(1),
        pendingPayout: increment(netAmount),
      });

      console.log("✅ Teacher ended session and payout updated");
    }

    // ✅ Student can only submit rating
    if (userType === "student" && rating > 0) {
      const teacherRef = doc(firestore, "teachers", teacherId);
      const snap = await getDoc(teacherRef);
      if (snap.exists()) {
        const { ratingSum = 0, ratingCount = 0 } = snap.data();
        const avg = parseFloat(
          ((ratingSum + rating) / (ratingCount + 1)).toFixed(1)
        );

        await updateDoc(teacherRef, {
          ratingCount: increment(1),
          ratingSum: increment(rating),
          rating: avg,
        });

        console.log("⭐ Student rating submitted");
      }
    }
  } catch (err) {
    console.error("❌ handleLessonEnd error:", err);
    throw new Error("Something went wrong");
  }
};
export default handleLessonEnd;

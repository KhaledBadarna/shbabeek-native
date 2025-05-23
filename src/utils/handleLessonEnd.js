import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { serverTimestamp } from "firebase/firestore";
import { increment } from "firebase/firestore";
const handleLessonEnd = async (
  appointmentId,
  barberId,
  paidAmount,
  rating,
  userType
) => {
  try {
    const appointmentRef = doc(firestore, "appointments", appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    if (!appointmentSnap.exists()) return;

    const appointmentData = appointmentSnap.data();
    const alreadyCompleted = appointmentData?.isAppointmentCompleted;

    // ✅ Only barber marks complete
    if (userType === "barber" && !alreadyCompleted) {
      await updateDoc(appointmentRef, {
        isAppointmentCompleted: true,
        endedBy: barberId,
        endedAt: serverTimestamp(),
      });

      const netAmount = Math.round(paidAmount * 0.93);

      console.log("✅ Teacher ended session and payout updated");
    }

    // ✅ Student can only submit rating
    if (userType === "client" && rating > 0) {
      const barberRef = doc(firestore, "barbers", barberId);
      const snap = await getDoc(barberRef);
      if (snap.exists()) {
        const { ratingSum = 0, ratingCount = 0 } = snap.data();
        const avg = parseFloat(
          ((ratingSum + rating) / (ratingCount + 1)).toFixed(1)
        );

        await updateDoc(barberRef, {
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

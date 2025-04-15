import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase";
import { setLessons } from "../redux/slices/lessonsSlice";
import { Timestamp } from "firebase/firestore";

const fetchLessons = async (userType, userId, dispatch) => {
  if (!userId) {
    console.warn("⚠️ No userId provided to fetchLessons.");
    return;
  }
  if (typeof dispatch !== "function") {
    console.error(
      "❌ Error: dispatch is not a function. Make sure it is passed correctly."
    );
    return;
  }

  try {
    const bookingDocRef = doc(firestore, "bookings", userId);
    const bookingDocSnapshot = await getDoc(bookingDocRef);

    if (!bookingDocSnapshot.exists()) {
      dispatch(setLessons([])); // ✅ Reset lessons if none exist
      return;
    }

    const { lessonIds } = bookingDocSnapshot.data() || {};
    if (!lessonIds || lessonIds.length === 0) {
      console.warn("⚠️ No lessons booked for user");
      dispatch(setLessons([])); // ✅ Reset lessons
      return;
    }

    const lessonsCollectionRef = collection(firestore, "lessons");
    const querySnapshot = await getDocs(lessonsCollectionRef);
    const fetchedLessons = [];

    for (const docSnap of querySnapshot.docs) {
      if (lessonIds.includes(docSnap.id)) {
        const lesson = { id: docSnap.id, ...docSnap.data() };
        fetchedLessons.push(lesson);

        // ✅ Get opposite user ID
        const oppositeUserId =
          userType === "student" ? lesson.teacherId : lesson.studentId;

        if (oppositeUserId) {
          const userCollection =
            userType === "student" ? "teachers" : "students";
          const oppositeUserDocRef = doc(
            firestore,
            userCollection,
            oppositeUserId
          );
          const oppositeUserSnap = await getDoc(oppositeUserDocRef);

          if (oppositeUserSnap.exists()) {
            const fullName = oppositeUserSnap.data().name || "Unknown User";
            const [first, last = ""] = fullName.split(" ");
            const formattedName = `${first} ${last.charAt(0)}.`.trim();

            const oppositeUserData = {
              id: oppositeUserSnap.id,
              name: formattedName,
              profileImage: oppositeUserSnap.data().profileImage || "",
            };

            // ✅ Attach opposite user data inside lesson
            lesson.oppositeUser = oppositeUserData;
          } else {
            console.warn(
              `⚠️ No user found with ID ${oppositeUserId} in ${userCollection}`
            );
            lesson.oppositeUser = { name: "Unknown", profileImage: "" };
          }
        }
      }
    }
    const sanitizedLessons = fetchedLessons.map((lesson) => ({
      ...lesson,
      createdAt:
        lesson.createdAt instanceof Timestamp
          ? lesson.createdAt.toDate().toISOString() // ✅ Convert Firestore Timestamp to ISO String
          : lesson.createdAt,
    }));

    dispatch(setLessons(sanitizedLessons)); // ✅ Store only serializable data in Redux
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
  }
};

export default fetchLessons;

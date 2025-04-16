import {
  collection,
  getDocs,
  getDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { setLessons } from "../redux/slices/lessonsSlice";

const fetchLessons = async (userType, userId, dispatch) => {
  if (!userId) return;

  if (typeof dispatch !== "function") {
    console.error("❌ Error: dispatch is not a function.");
    return;
  }

  try {
    const bookingDocRef = doc(firestore, "bookings", userId);
    const bookingDocSnapshot = await getDoc(bookingDocRef);

    if (!bookingDocSnapshot.exists()) {
      dispatch(setLessons([]));
      return;
    }

    const { lessonIds } = bookingDocSnapshot.data() || {};
    if (!lessonIds || lessonIds.length === 0) {
      dispatch(setLessons([]));
      return;
    }

    const lessonsCollectionRef = collection(firestore, "lessons");
    const querySnapshot = await getDocs(lessonsCollectionRef);
    const fetchedLessons = [];

    for (const docSnap of querySnapshot.docs) {
      if (!lessonIds.includes(docSnap.id)) continue;

      let lesson = { id: docSnap.id, ...docSnap.data() };

      // ✅ Sanitize createdAt
      const { createdAt, ...rest } = lesson;
      lesson = {
        ...rest,
        createdAt:
          createdAt instanceof Timestamp
            ? createdAt.toDate().toISOString()
            : typeof createdAt === "string"
            ? createdAt
            : null,
      };

      // ✅ Get opposite user ID
      const oppositeUserId =
        userType === "student" ? lesson.teacherId : lesson.studentId;

      if (oppositeUserId) {
        const userCollection = userType === "student" ? "teachers" : "students";
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

          lesson.oppositeUser = {
            id: oppositeUserSnap.id,
            name: formattedName,
            profileImage: oppositeUserSnap.data().profileImage || "",
          };
        } else {
          lesson.oppositeUser = { name: "Unknown", profileImage: "" };
        }
      }

      fetchedLessons.push(lesson);
    }

    dispatch(setLessons(fetchedLessons));
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
  }
};

export default fetchLessons;

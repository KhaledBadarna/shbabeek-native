import {
  collection,
  getDocs,
  getDoc,
  doc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { setLessons } from "../redux/slices/lessonsSlice";

const fetchLessons = async (userType, userId, dispatch) => {
  if (!userId || typeof dispatch !== "function") return;

  try {
    const bookingDocRef = doc(firestore, "bookings", userId);
    const bookingDoc = await getDoc(bookingDocRef);

    if (!bookingDoc.exists()) {
      dispatch(setLessons([]));
      return;
    }

    const { lessonIds } = bookingDoc.data() || {};
    if (!lessonIds || lessonIds.length === 0) {
      dispatch(setLessons([]));
      return;
    }

    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    const startDateStr = sunday.toISOString().split("T")[0];
    const endDateStr = saturday.toISOString().split("T")[0];

    const lessonsCollectionRef = collection(firestore, "lessons");
    const lessonChunks = [];
    for (let i = 0; i < lessonIds.length; i += 10) {
      const chunk = lessonIds.slice(i, i + 10);
      const q = query(lessonsCollectionRef, where("__name__", "in", chunk));
      lessonChunks.push(getDocs(q));
    }

    const querySnapshots = await Promise.all(lessonChunks);
    const rawLessons = [];

    for (const snap of querySnapshots) {
      for (const docSnap of snap.docs) {
        const lesson = { id: docSnap.id, ...docSnap.data() };
        const lessonDate = lesson.selectedDate;

        if (lessonDate < startDateStr || lessonDate > endDateStr) continue;

        const todayDate = new Date().toISOString().split("T")[0];
        if (lessonDate < todayDate) continue;

        if (lessonDate === todayDate) {
          const now = new Date();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          const [endH, endM] = lesson.endTime.split(":").map(Number);
          const endMinutes = endH * 60 + endM;
          if (endMinutes <= nowMinutes) continue;
        }

        const { createdAt, ...rest } = lesson;
        rawLessons.push({
          ...rest,
          id: docSnap.id,
          selectedDate: lessonDate,
          createdAt:
            createdAt instanceof Timestamp
              ? createdAt.toDate().toISOString()
              : typeof createdAt === "string"
              ? createdAt
              : null,
        });
      }
    }

    const uniqueUserIds = [
      ...new Set(
        rawLessons.map((lesson) =>
          userType === "student" ? lesson.teacherId : lesson.studentId
        )
      ),
    ];

    const userCollection = userType === "student" ? "teachers" : "students";
    const userFetchPromises = uniqueUserIds.map((id) =>
      getDoc(doc(firestore, userCollection, id))
    );
    const userSnaps = await Promise.all(userFetchPromises);

    const userMap = {};
    userSnaps.forEach((snap) => {
      if (snap.exists()) {
        const fullName = snap.data().name || "Unknown";
        const [first, last = ""] = fullName.split(" ");
        userMap[snap.id] = {
          id: snap.id,
          name: `${first} ${last.charAt(0)}.`.trim(),
          profileImage: snap.data().profileImage || "",
        };
      }
    });

    const finalLessons = rawLessons.map((lesson) => {
      const oppositeId =
        userType === "student" ? lesson.teacherId : lesson.studentId;
      return {
        ...lesson,
        oppositeUser: userMap[oppositeId] || {
          name: "Unknown",
          profileImage: "",
        },
      };
    });

    dispatch(setLessons(finalLessons));
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
  }
};

export default fetchLessons;

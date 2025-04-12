// import { collection, getDocs, getDoc, doc } from "firebase/firestore";
// import { firestore } from "../firebase";
// import { setLessons } from "../redux/slices/lessonsSlice";

// let hasFetchedLessons = false; // plain variable outside function

// const useFetchLessons = async (userId, dispatch) => {
//   if (!userId || hasFetchedLessons) return;

//   try {
//     const bookingDocRef = doc(firestore, "bookings", userId);
//     const bookingDocSnapshot = await getDoc(bookingDocRef);

//     if (!bookingDocSnapshot.exists()) {
//       dispatch(setLessons([]));
//       return;
//     }

//     const { lessonIds } = bookingDocSnapshot.data() || {};
//     if (!lessonIds || lessonIds.length === 0) {
//       dispatch(setLessons([]));
//       return;
//     }

//     const lessonsCollectionRef = collection(firestore, "lessons");
//     const querySnapshot = await getDocs(lessonsCollectionRef);
//     const fetchedLessons = [];

//     querySnapshot.forEach((doc) => {
//       if (lessonIds.includes(doc.id)) {
//         fetchedLessons.push({ id: doc.id, ...doc.data() });
//       }
//     });

//     const updatedLessons = fetchedLessons.filter(
//       (lesson) => lesson.isComplete === false
//     );

//     dispatch(setLessons(updatedLessons));
//     hasFetchedLessons = true; // 🧠 prevent future fetches
//   } catch (error) {
//     console.error("❌ Error fetching lessons:", error);
//   }
// };

// export default useFetchLessons;

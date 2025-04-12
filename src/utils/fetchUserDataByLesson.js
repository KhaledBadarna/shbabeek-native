import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase";

const fetchUserDataByLesson = async (lessonId, currentRole) => {
  try {
    // Step 1: Fetch the lesson document
    const lessonDocRef = doc(firestore, "lessons", lessonId);
    const lessonDoc = await getDoc(lessonDocRef);

    if (!lessonDoc.exists()) {
      throw new Error("Lesson not found");
    }

    const lessonData = lessonDoc.data();

    // Step 2: Determine the related user ID
    const relatedUserId =
      currentRole === "teacher" ? lessonData.studentId : lessonData.teacherId;

    // Step 3: Fetch the related user's data
    const userCollection = currentRole === "teacher" ? "students" : "teachers";
    const userDocRef = doc(firestore, userCollection, relatedUserId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    // Return the name of the related user
    return userData.name;
  } catch (error) {
    console.error("Error fetching related user name:", error);
    return "Unknown User";
  }
};

export default fetchUserDataByLesson;

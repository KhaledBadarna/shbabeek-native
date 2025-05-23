import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase";

const fetchUserDataByLesson = async (appointmentId, currentRole) => {
  try {
    // Step 1: Fetch the appointment document
    const appointmentDocRef = doc(firestore, "appointments", appointmentId);
    const appointmentDoc = await getDoc(appointmentDocRef);

    if (!appointmentDoc.exists()) {
      throw new Error("Lesson not found");
    }

    const appointmentData = appointmentDoc.data();

    // Step 2: Determine the related user ID
    const relatedUserId =
      currentRole === "barber" ? appointmentData.clientId : appointmentData.barberId;

    // Step 3: Fetch the related user's data
    const userCollection = currentRole === "barber" ? "clients" : "barbers";
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

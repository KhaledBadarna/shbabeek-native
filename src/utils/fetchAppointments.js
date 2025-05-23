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
import { setLessons } from "../redux/slices/appointmentsSlice";

const fetchAppointments = async (userType, userId, dispatch) => {
  if (!userId || typeof dispatch !== "function") return;

  try {
    const bookingDocRef = doc(firestore, "bookings", userId);
    const bookingDoc = await getDoc(bookingDocRef);

    if (!bookingDoc.exists()) {
      dispatch(setLessons([]));
      return;
    }

    const { appointmentIds } = bookingDoc.data() || {};
    if (!appointmentIds || appointmentIds.length === 0) {
      dispatch(setLessons([]));
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const appointmentsCollectionRef = collection(firestore, "appointments");
    const appointmentChunks = [];
    for (let i = 0; i < appointmentIds.length; i += 10) {
      const chunk = appointmentIds.slice(i, i + 10);
      const q = query(
        appointmentsCollectionRef,
        where("__name__", "in", chunk)
      );
      appointmentChunks.push(getDocs(q));
    }

    const querySnapshots = await Promise.all(appointmentChunks);
    const upcomingAppointments = [];

    for (const snap of querySnapshots) {
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const date = data.selectedDate;

        if (date < todayStr) continue;

        if (date === todayStr) {
          const now = new Date();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          const [endH, endM] = data.endTime.split(":").map(Number);
          const endMinutes = endH * 60 + endM;
          if (endMinutes <= nowMinutes) continue;
        }

        const { createdAt, endedAt, ...rest } = data;

        upcomingAppointments.push({
          ...rest,
          id: docSnap.id,
          selectedDate: date,
          createdAt:
            createdAt instanceof Timestamp
              ? createdAt.toDate().toISOString()
              : createdAt || null,
          endedAt:
            endedAt instanceof Timestamp
              ? endedAt.toDate().toISOString()
              : endedAt || null,
        });
      }
    }

    const oppositeIds = [
      ...new Set(
        upcomingAppointments.map((appt) =>
          userType === "client" ? appt.barberId : appt.clientId
        )
      ),
    ];

    const collectionName = userType === "client" ? "barbers" : "clients";
    const userSnaps = await Promise.all(
      oppositeIds.map((id) => getDoc(doc(firestore, collectionName, id)))
    );

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

    const finalAppointments = upcomingAppointments.map((appt) => {
      const oppositeId = userType === "client" ? appt.barberId : appt.clientId;
      return {
        ...appt,
        oppositeUser: userMap[oppositeId] || {
          name: "Unknown",
          profileImage: "",
        },
      };
    });

    // Sort appointments by selectedDate and startTime
    const sortedAppointments = finalAppointments.sort((a, b) => {
      const timeA = new Date(`${a.selectedDate}T${a.startTime}`);
      const timeB = new Date(`${b.selectedDate}T${b.startTime}`);
      return timeA - timeB;
    });

    dispatch(setLessons(sortedAppointments));
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
  }
};

export default fetchAppointments;

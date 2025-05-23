// // StudentLessonsScreen.js
// import React, { useEffect, useState, useMemo } from "react";
// import { View, ActivityIndicator } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import fetchAppointments from "../../utils/fetchAppointments";
// import WeeklyDateSelector from "../../components/WeeklyDateSelector";
// import AppointmentsCard from "../../components/AppointmentsCard";
// import { selectAppointmentsState } from "../../redux/selectors/appointmentsSelectors";

// const StudentLessonsScreen = () => {
//   const dispatch = useDispatch();
//   const { userType, userId } = useSelector((state) => state.user);
//   const appointments = useSelector(selectAppointmentsState);
//   const loading = useSelector((state) => state.loading || false);

//   const [selectedDate, setSelectedDate] = useState("");

//   useEffect(() => {
//     fetchAppointments(userType, userId, dispatch);
//   }, [userId, userType, dispatch]);

//   const appointmentsForDate = useMemo(() => {
//     return appointments.filter(
//       (appointment) =>
//         appointment.selectedDate === selectedDate &&
//         !appointment.isAppointmentCompleted
//     );
//   }, [appointments, selectedDate]);

//   if (loading) {
//     return <ActivityIndicator size="large" color="#0095ff" />;
//   }

//   return (
//     <View style={{ flex: 1, backgroundColor: "#fff" }}>
//       <View style={{ backgroundColor: "#fff", padding: 10, borderRadius: 10 }}>
//         <WeeklyDateSelector
//           selectedDate={selectedDate}
//           onSelectDate={setSelectedDate}
//           availableSlots={appointments.filter(
//             (appointment) => !appointment.isAppointmentCompleted
//           )}
//           type="appointments"
//         />

//         <AppointmentsCard
//           appointments={[...appointmentsForDate].sort((a, b) => {
//             const toMinutes = (t) => {
//               const [h, m] = t.split(":").map(Number);
//               return h * 60 + m;
//             };
//             return toMinutes(a.startTime) - toMinutes(b.startTime);
//           })}
//         />
//       </View>
//     </View>
//   );
// };

// export default StudentLessonsScreen;

// // AppointmentsCard.js

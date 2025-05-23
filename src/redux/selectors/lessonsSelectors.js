import { createSelector } from "reselect";

// ✅ Select appointments state from Redux
const selectAppointmentsState = (state) => state.appointments;

// ✅ Memoized selector to normalize appointments data
export const selectAppointments = createSelector(
  [selectAppointmentsState],
  (appointments) => {
    if (!appointments || !Array.isArray(appointments)) return [];

    return appointments.map((appointment) => ({
      ...appointment,
      oppositeUser: appointment.oppositeUser || {
        name: "Unknown",
        profileImage: "",
      },
    }));
  }
);

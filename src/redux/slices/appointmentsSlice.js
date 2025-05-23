import { createSlice } from "@reduxjs/toolkit";

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState: [],
  reducers: {
    setLessons: (state, action) => action.payload, // ✅ Store all appointments
    addLesson: (state, action) => {
      // ✅ Add single appointment
      state.push(action.payload);
    },
    updateLessonWithUser: (state, action) => {
      // ✅ Update appointment with opposite user details
      const { appointmentId, userData } = action.payload;
      const appointment = state.find((l) => l.id === appointmentId);
      if (appointment) {
        appointment.oppositeUser = userData; // ✅ Attach opposite user data
      }
    },
    removeLesson: (state, action) => {
      return state.filter((appointment) => appointment.id !== action.payload);
    },
  },
});

export const { setLessons, addLesson, updateLessonWithUser, removeLesson } =
  appointmentsSlice.actions;
export default appointmentsSlice.reducer;

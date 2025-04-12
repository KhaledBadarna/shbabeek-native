import { createSlice } from "@reduxjs/toolkit";

const lessonsSlice = createSlice({
  name: "lessons",
  initialState: [],
  reducers: {
    setLessons: (state, action) => action.payload, // ✅ Store all lessons
    addLesson: (state, action) => {
      // ✅ Add single lesson
      state.push(action.payload);
    },
    updateLessonWithUser: (state, action) => {
      // ✅ Update lesson with opposite user details
      const { lessonId, userData } = action.payload;
      const lesson = state.find((l) => l.id === lessonId);
      if (lesson) {
        lesson.oppositeUser = userData; // ✅ Attach opposite user data
      }
    },
  },
});

export const { setLessons, addLesson, updateLessonWithUser } =
  lessonsSlice.actions;
export default lessonsSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bio: "",
  pricePerHour: "",
  stages: [],
  topics: [],
  rating: 0,
  ratingCount: 0,
  bankDetails: {}, // ✅ Bank info
  pendingPayout: 0,
  totalEarned: 0,
  profileImage: "", // optional if you want it here
  lessonsCount: 0,
};

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    setTeacherData(state, action) {
      const { updatedAt, createdAt, ...cleanData } = action.payload;
      return { ...state, ...cleanData }; // ✅ Safe shallow merge of new data
    },
    resetTeacherData() {
      return initialState; // ✅ Clean reset
    },
  },
});

export const { setTeacherData, resetTeacherData } = teacherSlice.actions;
export default teacherSlice.reducer;

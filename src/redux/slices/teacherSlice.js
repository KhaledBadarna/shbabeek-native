import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bio: "",
  pricePerHour: "",
  stages: [],
  topics: [],
  rating: 0,
  ratingCount: 0,
  bankDetails: {}, // ✅ Added bankDetails
};

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    setTeacherData(state, action) {
      const { updatedAt, createdAt, ...cleanData } = action.payload; // ✅ Remove timestamps
      Object.assign(state, cleanData);
    },
    resetTeacherData(state) {
      state.bio = "";
      state.pricePerHour = "";
      state.stages = [];
      state.topics = [];
      state.rating = 0;
      state.ratingCount = 0;
      state.bankDetails = {}; // ✅ Reset bank details
      state.pendingPayout = 0;
      state.totalEarned = 0;
    },
  },
});

export const { setTeacherData, resetTeacherData } = teacherSlice.actions;

export default teacherSlice.reducer;

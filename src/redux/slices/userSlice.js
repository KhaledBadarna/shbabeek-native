import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userType: "student", // Or "teacher"
  name: "",
  phone: "",
  userId: "",
  profileImage: "",
  defaultPaymentMethod: "",
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo(state, action) {
      const { updatedAt, createdAt, ...cleanData } = action.payload; // ✅ Remove timestamps
      Object.assign(state, cleanData);
    },
    logout(state) {
      state.name = "";
      state.phone = "";
      state.userId = "";
      state.defaultPaymentMethod = "";
      state.isLoggedIn = false;
      state.userType = "student";
      state.profileImage = "";
    },
    setUserType(state, action) {
      state.userType = action.payload;
    },
  },
});

export const { setUserInfo, logout, setUserType } = userSlice.actions;

export default userSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pendingPayout: 0,
  totalEarned: 0,
  rating: 0,
  ratingCount: 0,
  profileImage: "",
  salonName: "",
  introVideo: null,
  isAvailable: false,
  location: "",
  bankDetails: {
    fullName: "",
    bankNumber: "",
    branchBank: "",
    accountNumber: "",
  },
  services: {
    hair: 0,
    beard: 0,
    both: 0,
    kids: 0,
  },
};

const barberSlice = createSlice({
  name: "barber",
  initialState,
  reducers: {
    setBarberData(state, action) {
      const { updatedAt, createdAt, ...cleanData } = action.payload;
      return { ...state, ...cleanData };
    },
    resetBarberData() {
      return initialState;
    },
  },
});

export const { setBarberData, resetBarberData } = barberSlice.actions;
export default barberSlice.reducer;

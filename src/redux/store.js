import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice"; // ✅ User info (shared)
import barberReducer from "./slices/barberSlice"; // ✅ Teacher-specific data
import favoritesReducer from "./slices/favoritesSlice"; // ✅ Student favorites
import appointmentsReducer from "./slices/appointmentsSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    barber: barberReducer,
    favorites: favoritesReducer,
    appointments: appointmentsReducer, // ✅ Ensure "appointments" is correctly named
  },
});

export default store;

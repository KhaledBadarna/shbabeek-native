import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice"; // ✅ User info (shared)
import teacherReducer from "./slices/teacherSlice"; // ✅ Teacher-specific data
import favoritesReducer from "./slices/favoritesSlice"; // ✅ Student favorites
import lessonsReducer from "./slices/lessonsSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    teacher: teacherReducer,
    favorites: favoritesReducer,
    lessons: lessonsReducer, // ✅ Ensure "lessons" is correctly named
  },
});

export default store;

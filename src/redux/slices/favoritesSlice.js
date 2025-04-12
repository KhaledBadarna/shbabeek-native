import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  favorites: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    setFavorites(state, action) {
      state.favorites = action.payload; // ✅ Set full favorites list
    },
    addFavorite(state, action) {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFavorite(state, action) {
      state.favorites = state.favorites.filter(
        (teacherId) => teacherId !== action.payload
      );
    },
    resetFavorites(state) {
      state.favorites = [];
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite, resetFavorites } =
  favoritesSlice.actions;

export default favoritesSlice.reducer;

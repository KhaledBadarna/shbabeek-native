import { createSelector } from "reselect";

// ✅ Select lessons state from Redux
const selectLessonsState = (state) => state.lessons;

// ✅ Memoized selector that ensures lessons return a consistent reference
export const selectLessons = createSelector([selectLessonsState], (lessons) => {
  if (!lessons || !Array.isArray(lessons)) return [];

  return lessons.map((lesson) => ({
    ...lesson,
    oppositeUser: lesson.oppositeUser || { name: "Unknown", profileImage: "" }, // ✅ Ensure oppositeUser is always present
  }));
});

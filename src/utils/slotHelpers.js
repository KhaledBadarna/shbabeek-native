export const groupSlotsByTimePeriod = (slots = []) => {
  const grouped = {
    الصباح: [],
    الظهيره: [],
    المساء: [],
    الليل: [],
  };

  const toMinutes = (t) => {
    if (!t || typeof t !== "string" || !t.includes(":")) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  (slots || []).forEach((slot) => {
    const start = toMinutes(slot.startTime);

    if (start >= 360 && start < 720) grouped["الصباح"].push(slot);
    else if (start >= 720 && start < 1020) grouped["الظهيره"].push(slot);
    else if (start >= 1020 && start < 1260) grouped["المساء"].push(slot);
    else grouped["الليل"].push(slot);
  });

  return grouped;
};

// ✅ This must be declared separately and exported if needed
export const getIconForPeriod = (period) => {
  switch (period) {
    case "الصباح":
      return "weather-sunset-up";
    case "الظهيره":
      return "weather-sunny";
    case "المساء":
      return "weather-sunset-down";
    case "الليل":
      return "weather-night";
    default:
      return "schedule";
  }
};

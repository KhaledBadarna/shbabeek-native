export const filterSlotsByService = (
  slots,
  selectedDayName,
  selectedService
) => {
  if (!selectedService) return [];

  const serviceDurations = {
    راس: 50,
    ذقن: 20,
    أطفال: 30,
    "رأس وذقن": 70,
  };

  const requiredMinutes = serviceDurations[selectedService] || 0;

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const toTimeStr = (m) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(
      2,
      "0"
    )}`;

  return slots
    .filter((slot) => slot.day === selectedDayName && !slot.isBooked)
    .flatMap((slot) => {
      const start = toMinutes(slot.startTime);
      const end = toMinutes(slot.endTime);
      const parts = [];

      for (let t = start; t + requiredMinutes <= end; t += requiredMinutes) {
        const part = {
          ...slot,
          id: `${slot.day}-${slot.startTime}-${slot.endTime}-${t}`,
          startTime: toTimeStr(t),
          endTime: toTimeStr(t + requiredMinutes),
        };
        parts.push(part);
      }

      return parts;
    });
};

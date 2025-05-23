export const generateSmartSlots = (
  workingPeriods = [],
  bookedIntervals = [],
  durationInMinutes = 30
) => {
  const result = [];

  const parse = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const format = (mins) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const booked = bookedIntervals
    .map(([start, end]) => [parse(start), parse(end)])
    .sort((a, b) => a[0] - b[0]);

  for (const [startStr, endStr] of workingPeriods) {
    let current = parse(startStr);
    const end = parse(endStr);

    while (current + durationInMinutes <= end) {
      const slotStart = current;
      const slotEnd = current + durationInMinutes;

      const overlaps = booked.some(
        ([bStart, bEnd]) => !(slotEnd <= bStart || slotStart >= bEnd)
      );

      if (!overlaps) {
        result.push({
          startTime: format(slotStart),
          endTime: format(slotEnd),
        });
      }

      current += 5; // move in 5-minute increments
    }
  }

  return result;
};

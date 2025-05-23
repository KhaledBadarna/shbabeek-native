import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const SlotList = ({ slots, selectedSlots, onSlotPress }) => {
  const parseTime = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const isOverlapping = (slotA, slotB) => {
    const startA = parseTime(slotA.startTime);
    const endA = parseTime(slotA.endTime);
    const startB = parseTime(slotB.startTime);
    const endB = parseTime(slotB.endTime);
    return !(endA <= startB || startA >= endB);
  };

  return (
    <View style={styles.slotListWrapper}>
      {slots.map((slot) => {
        const isSelected = selectedSlots.some((s) => s.id === slot.id);
        const hasConflict = selectedSlots.some(
          (s) =>
            s.id !== slot.id &&
            s.selectedDate === slot.selectedDate && // <-- this fixes the bug
            isOverlapping(s, slot)
        );

        return (
          <TouchableOpacity
            key={slot.id}
            onPress={() => onSlotPress(slot)}
            disabled={hasConflict && !isSelected}
            style={[
              styles.slotButton,
              isSelected && styles.slotSelected,
              hasConflict && !isSelected && styles.slotDisabled,
            ]}
          >
            <Text style={styles.slotText}>
              {slot.startTime} - {slot.endTime}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  slotListWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 10,
  },
  slotButton: {
    backgroundColor: "#ffffff", // خلفية بيضاء
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  slotSelected: {
    backgroundColor: "#009dff", // أزرق للاختيار
  },
  slotDisabled: {
    backgroundColor: "#ccc", // رمادي للفتحات المتضاربة
  },
  slotText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
});

export default SlotList;

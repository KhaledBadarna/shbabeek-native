import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

const durations = Array.from({ length: 12 }, (_, i) => (i + 1) * 5); // [5, 10, ..., 60]

const DurationSelector = ({ selected, onSelect }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const index = durations.indexOf(selected);
    if (index >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({
        x: index * 70, // approximate width per item
        animated: true,
      });
    }
  }, [selected]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {durations.map((min) => (
        <TouchableOpacity
          key={min}
          style={[styles.option, selected === min && styles.selectedOption]}
          onPress={() => onSelect(min)}
        >
          <Text style={[styles.text, selected === min && styles.selectedText]}>
            {min}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    gap: 10,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  selectedOption: {
    backgroundColor: "#009dff",
  },
  text: {
    fontSize: 14,
    fontFamily: "Cairo",
    color: "#333",
    fontWeight: "bold",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default DurationSelector;

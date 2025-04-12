import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const ToggleButtons = ({ options, selected, onSelect }) => {
  return (
    <View style={styles.buttonContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.button,
            selected === option.value
              ? styles.activeButton
              : styles.inactiveButton,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.buttonText,
              selected === option.value
                ? styles.activeButtonText
                : styles.inactiveButtonText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    backgroundColor: "#f1f1f1",
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 2,
  },
  activeButton: {
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#f1f1f1",
  },
  inactiveButton: {
    backgroundColor: "#f1f1f1",
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "Cairo",
    fontWeight: "700",
  },
  activeButtonText: {
    color: "#333",
  },
  inactiveButtonText: {
    color: "#a1a1a1",
  },
});

export default ToggleButtons;

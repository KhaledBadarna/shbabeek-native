import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Function to categorize slots
const categorizeSlotByTime = (startTime) => {
  const hour = parseInt(startTime.split(":")[0], 10);
  if (hour >= 6 && hour < 12) return "الصباح";
  if (hour >= 12 && hour < 18) return "الظهيرة";
  return "المساء";
};

// Function to group slots by time category
const groupSlotsByTime = (slots) => {
  return slots.reduce((groups, slot) => {
    const category = categorizeSlotByTime(slot.startTime);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(slot);
    return groups;
  }, {});
};

const SlotList = ({ slots, onSlotPress }) => {
  const groupedSlots = groupSlotsByTime(slots);

  return (
    <View style={{ flex: 1 }}>
      {Object.keys(groupedSlots).length === 0 ? (
        <Text style={styles.noSlotsText}>لا توجد مواعيد متاحة لهذا اليوم</Text>
      ) : (
        <FlatList
          data={Object.keys(groupedSlots)}
          keyExtractor={(category) => category}
          renderItem={({ item: category }) => {
            const iconName =
              category === "الصباح"
                ? "weather-sunset"
                : category === "الظهيرة"
                ? "weather-sunny"
                : "weather-night";

            return (
              <View key={category} style={styles.categoryContainer}>
                <View style={styles.categoryHeader}>
                  <Icon name={iconName} size={30} color="#031417" />
                  <Text style={styles.categoryTitle}>{category}</Text>
                </View>

                {/* Render slots in two columns */}
                <FlatList
                  data={groupedSlots[category]}
                  keyExtractor={(slot) => slot.id}
                  numColumns={2}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.slotContainer}
                      onPress={() => onSlotPress(item)}
                    >
                      <Text style={styles.slotText}>
                        {item.startTime} - {item.endTime}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginVertical: 10,
  },
  categoryHeader: { flexDirection: "row-reverse", margin: 10 },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#031417",
    marginRight: 8,
    fontFamily: "Cairo",
  },
  slotContainer: {
    width: "48%",
    margin: "1%",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgb(220, 220, 220)",
  },
  slotText: {
    color: "#031417",
    fontSize: 13,
    fontFamily: "Cairo",
    fontWeight: "700",
  },
  noSlotsText: {
    fontSize: 16,
    color: "#999",
    fontFamily: "Cairo",
    textAlign: "center",
    marginTop: 40,
  },
});

export default SlotList;

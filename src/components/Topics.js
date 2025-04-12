import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Topics = ({ onPress, selectedTopics }) => {
  const topics = [
    { id: "1", name: "رياضيات", icon: "calculator-variant" },
    { id: "2", name: "فيزياء", icon: "atom" },
    { id: "3", name: "كيمياء", icon: "test-tube" },
    { id: "4", name: "أحياء", icon: "bacteria-outline" },
    { id: "5", name: "لغة عربية", icon: "abjad-arabic" },
    { id: "6", name: "English", icon: "alphabetical" },
    { id: "7", name: "עברית", icon: "abjad-hebrew" },
    { id: "8", name: "برمجة", icon: "microsoft-visual-studio-code" },
  ];

  // Define a set of colors for icons
  const topicColors = [
    "#031417", // Dark Blue
    "#031417", // Dark Blue
    "#031417", // Dark Blue
    "#031417", // Dark Blue
    "#031417", // Dark Blue
    "#031417", // Dark Blue
    "#031417", // Dark Blue
    "#031417", // Dark Blue
  ];

  const renderTopic = ({ item, index }) => {
    const isSelected = selectedTopics.includes(item.name); // ✅ Compare by name only

    return (
      <TouchableOpacity
        key={index}
        onPress={() => onPress(item)} // ✅ Pass full topic object, but store only the name
        style={[
          styles.topicContainer,
          isSelected && styles.selectedTopic, // ✅ Change background if selected
        ]}
      >
        <Icon
          style={{
            borderRadius: 5,

            marginLeft: 3,
          }}
          name={item.icon}
          size={20}
          color={"#031417"}
        />
        <Text style={styles.topicText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.titleIconCont}>
        <Text style={styles.sectionTitle}>المواضيع</Text>
        <Icon name="bookshelf" size={30} color="#555" />
      </View>

      <Text
        style={{
          textAlign: "right",
          color: "#cdcdcd",
          fontFamily: "Cairo",
          fontSize: 12,
        }}
      >
        يمكنك اختيار حتى 5 مواضيع
      </Text>
      <FlatList
        data={topics}
        renderItem={({ item, index }) => renderTopic({ item, index })}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.topicsList}
        scrollEnabled={false} // Disable scrolling
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",

    color: "#031417",
    fontFamily: "Cairo",
  },

  topicContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f1f1f1",
    margin: 3,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    flexDirection: "row-reverse",
  },
  selectedTopic: {
    backgroundColor: "#00e5ff", // The background color when the topic is selected
  },
  topicText: {
    fontSize: 14,
    color: "#031417",
    fontFamily: "Cairo",
  },
  titleIconCont: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
export default Topics;

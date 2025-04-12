import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import TeacherCard from "../../components/TeacherCard";
import { firestore } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const TopicTeachersScreen = ({ route, navigation }) => {
  const { topic } = route.params;
  const topicName = topic.name;
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortFilters, setSortFilters] = useState({
    highestRated: false,
    lowestCost: false,
  });
  const [selectedCategories, setSelectedCategories] = useState([]);

  const scrollViewRef = useRef(null); // Create a reference for ScrollView

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersRef = collection(firestore, "teachers");
        const q = query(
          teachersRef,
          where("topics", "array-contains", topicName)
        );

        const querySnapshot = await getDocs(q);

        let fetchedTeachers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Apply Sorting based on selected filters
        if (sortFilters.lowestCost) {
          // Sort by lowest price (ascending order)
          fetchedTeachers = fetchedTeachers.sort((a, b) => {
            return parseFloat(a.pricePerHour) - parseFloat(b.pricePerHour); // Ensuring proper comparison as numbers
          });
        }

        if (sortFilters.highestRated) {
          // Sort by highest rating (descending order)
          fetchedTeachers = fetchedTeachers.sort((a, b) => {
            return b.rating - a.rating; // Higher rating comes first
          });
        }

        setTeachers(fetchedTeachers);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [topicName, sortFilters]); // Fetch teachers whenever filters change

  const handleTeacherPress = (teacher) => {
    navigation.navigate("صفحة المعلم", {
      teacher: teacher,
      teacherId: teacher.id,
      topicName,
    });
  };

  const toggleSortFilter = (filter) => {
    setSortFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
      // Ensure the other filter is turned off when one is toggled
      [filter === "highestRated" ? "lowestCost" : "highestRated"]: false,
    }));
  };

  const handleCategorySelect = (category) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((cat) => cat !== category)
        : [...prevCategories, category]
    );
  };

  const renderCard = ({ item }) => {
    return (
      <TeacherCard
        name={item.name}
        studentGradeLevel={item.stages?.join(", ")}
        profileImage={item.profileImage}
        price={item.pricePerHour || "غير محدد"}
        topics={item.topics?.join(", ")}
        rating={item.rating || 0}
        ratingCount={item.ratingCount || 0}
        onPress={() => handleTeacherPress(item)}
        teacherId={item.id}
      />
    );
  };

  // Sorting teachers based on the selected filters (price and rating)
  let filteredTeachers = [...teachers];

  // Apply category filter (if selected)
  if (selectedCategories.length > 0) {
    filteredTeachers = filteredTeachers.filter(
      (teacher) =>
        selectedCategories.every((cat) => teacher.stages?.includes(cat)) // Ensure teacher teaches all selected levels
    );
  }

  // Sorting the filtered teachers based on the selected filter (rating or price)
  // If highestRated filter is selected, sort by rating descending (from 5 to 0)
  if (sortFilters.highestRated) {
    filteredTeachers.sort((a, b) => b.rating - a.rating); // Sort by rating descending
  }
  // If lowestCost filter is selected, sort by price ascending (from low to high)
  else if (sortFilters.lowestCost) {
    filteredTeachers.sort((a, b) => a.pricePerHour - b.pricePerHour); // Sort by price ascending
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00adf0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sorting Filters */}
      <View style={styles.filters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterButtons}
          ref={scrollViewRef} // Attach the ref to the ScrollView
        >
          <View style={styles.filterButtons}>
            {["ثانوي", "اعدادي", "ابتدائي"].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  selectedCategories.includes(category) && styles.activeFilter,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedCategories.includes(category) &&
                      styles.filterTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.filterButton,
                sortFilters.highestRated && styles.activeFilter,
              ]}
              onPress={() => toggleSortFilter("highestRated")}
            >
              <Text
                style={[
                  styles.filterText,
                  sortFilters.highestRated && styles.filterTextActive,
                ]}
              >
                الأعلى تقييماً
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                sortFilters.lowestCost && styles.activeFilter,
              ]}
              onPress={() => toggleSortFilter("lowestCost")}
            >
              <Text
                style={[
                  styles.filterText,
                  sortFilters.lowestCost && styles.filterTextActive,
                ]}
              >
                الأقل تكلفة
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Teacher Cards Grid */}
      <View style={styles.filterContainer}>
        <FlatList
          data={filteredTeachers} // Make sure filteredTeachers contain the sorted results
          key={2}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    writingDirection: "rtl",
  },
  filters: {
    padding: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#ebebeb",
  },
  filterButtons: {
    flexDirection: "row", // Keep items in a row (noطضt reversed)
    paddingLeft: 50, // Give extra space on the left to push the content to the right
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#ececec",
    marginRight: 10,
    marginTop: 10,
  },
  activeFilter: {
    backgroundColor: "#00e5ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 10,
  },
  filterText: {
    color: "#555",
    fontSize: 12,
    textAlign: "right",
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
  filterTextActive: {
    color: "#fff",
    fontSize: 12,
    textAlign: "right",
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
  filterContainer: {
    backgroundColor: "#f3f3f3",
  },
  listContainer: {
    paddingBottom: 100,
    paddingHorizontal: 10,
    marginTop: 10,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TopicTeachersScreen;

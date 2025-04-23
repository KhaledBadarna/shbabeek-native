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
  const [allTeachers, setAllTeachers] = useState([]);
  const [displayedTeachers, setDisplayedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortFilters, setSortFilters] = useState({
    highestRated: false,
    lowestCost: false,
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [lastIndex, setLastIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const fetchAllTeachers = async () => {
      try {
        setLoading(true);
        const teachersRef = collection(firestore, "teachers");
        const q = query(
          teachersRef,
          where("topics", "array-contains", topicName)
        );
        const snapshot = await getDocs(q);

        let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        data = data.sort(() => 0.5 - Math.random()); // Shuffle

        setAllTeachers(data);
        setDisplayedTeachers(data.slice(0, 10));
        setLastIndex(10);
        setHasMore(data.length > 10);
      } catch (err) {
        console.error("❌ Error fetching teachers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTeachers();
  }, [topicName]);

  useEffect(() => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }
    }, 100);
  }, []);

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
    console.log("item", item);
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

  const getFilteredTeachers = () => {
    let filtered = [...displayedTeachers];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((teacher) =>
        selectedCategories.every((cat) => teacher.stages?.includes(cat))
      );
    }

    if (sortFilters.highestRated) {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortFilters.lowestCost) {
      filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
    }

    return filtered;
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextIndex = lastIndex + 10;
    const nextBatch = allTeachers.slice(lastIndex, nextIndex);
    setDisplayedTeachers((prev) => [...prev, ...nextBatch]);
    setLastIndex(nextIndex);
    if (nextIndex >= allTeachers.length) setHasMore(false);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009dff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingStart: 15,
          }}
          style={{ direction: "rtl" }} // <-- this tells it to scroll from right
          ref={scrollViewRef}
        >
          <View style={styles.filterButtonsInner}>
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

      <View style={styles.filterContainer}>
        <FlatList
          data={getFilteredTeachers()}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            !hasMore ? (
              <Text
                style={{
                  textAlign: "center",
                  paddingVertical: 20,
                  color: "#888",
                  fontFamily: "Cairo",
                }}
              >
                لا يوجد معلمين إضافيين
              </Text>
            ) : null
          }
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
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  filterButtonsInner: {
    flexDirection: "row-reverse",
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
    backgroundColor: "#009dff",
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
    backgroundColor: "#fbfbfb",
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

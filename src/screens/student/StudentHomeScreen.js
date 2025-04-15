import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import TeacherCard from "../../components/TeacherCard";
import { useSelector } from "react-redux";
import { firestore } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const StudentHomeScreen = ({ navigation }) => {
  const { name, userId, isLoggedIn, profileImage } = useSelector(
    (state) => state.user
  ); // Use favorites from Redux
  const { favorites } = useSelector((state) => state.favorites);

  const [teachersData, setTeachersData] = useState([]);

  const handleTeacherPress = (teacher, teacherId) => {
    navigation.navigate("صفحة المعلم", {
      teacher: teacher,
      teacherId: teacherId,
      topicName: teacher.topics[0],
    });
  };
  console.log("🧠 Redux profileImage:", profileImage);
  useEffect(() => {
    const fetchTeachersData = async () => {
      if (favorites.length > 0) {
        try {
          const fetchedTeachers = [];

          // Iterate over the favorites (teacher IDs)
          for (let teacherId of favorites) {
            const teacherRef = doc(firestore, "teachers", teacherId);
            const teacherDoc = await getDoc(teacherRef);
            if (teacherDoc.exists()) {
              fetchedTeachers.push(teacherDoc.data());
            } else {
              console.log(`No data for teacherId: ${teacherId}`);
            }
          }

          // Set the fetched teacher data in state
          setTeachersData(fetchedTeachers);
        } catch (error) {
          console.error("Error fetching teachers data:", error);
        }
      } else {
        console.log("No favorite teachers found.");
      }
    };

    // Ensure the user is logged in and has favorites
    if (isLoggedIn && userId) {
      fetchTeachersData();
    } else {
      console.log("User is not logged in or userId is missing");
    }
  }, [favorites, isLoggedIn, userId]);

  const topics = [
    {
      id: "1",
      name: "رياضيات",
      image: require("../../assets/calculator.png"),
    },
    {
      id: "2",
      name: "فيزياء",
      image: require("../../assets/relativity.png"),
    },
    {
      id: "3",
      name: "كيمياء",
      image: require("../../assets/flask.png"),
    },
    {
      id: "4",
      name: "أحياء",
      image: require("../../assets/microscope.png"),
    },
    { id: "5", name: "لغة عربية", image: require("../../assets/arabic.png") },
    {
      id: "6",
      name: "English",
      image: require("../../assets/abc.png"),
    },
    { id: "7", name: "עברית", image: require("../../assets/aleph.png") },
    {
      id: "8",
      name: "برمجة",
      image: require("../../assets/code.png"),
    },
  ];

  const renderTeacher = ({ item, index }) => {
    const teacherId = favorites[index]; // Get the teacherId from the favorites array based on the index

    return (
      <View style={styles.teacherCardWrapper}>
        <TeacherCard
          name={item.name}
          studentGradeLevel={item.stages}
          price={item.pricePerHour}
          rating={item.rating}
          ratingCount={item.ratingCount}
          profileImage={item.profileImage}
          onPress={() => handleTeacherPress(item, favorites[index])}
          topics={item.topics}
          teacherId={favorites[index]} // Ensure teacherId is passed correctly
          showDetails={false}
          customStyle={{
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: "#f1f1f1",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 3,
            paddingHorizontal: 40,
            margin: 5,
          }}
        />
      </View>
    );
  };
  const renderTopic = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("TopicTeachersScreen", { topic: item })
      }
      style={styles.topicContainer}
    >
      <Image source={item.image} style={{ width: 80, height: 80 }} />

      <Text style={styles.topicText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={
        <>
          <View
            style={{
              backgroundColor: "#ffffff",
              marginBottom: 10,
              borderRadius: 10,
              padding: 10,
            }}
          >
            <View style={styles.greetingRow}>
              <Image
                source={
                  profileImage
                    ? { uri: `${profileImage}?v=${new Date().getTime()}` } // bust cache
                    : require("../../assets/noUserImage.png")
                }
                style={styles.profileImage}
              />
              <Text style={styles.greeting}>مرحباً، {name}!</Text>
            </View>
            <Text style={styles.subTitle}>ماذا تود أن تتعلم اليوم؟</Text>
          </View>

          {/* Topic List */}
          <View style={styles.topicsContainer}>
            <Text style={styles.sectionTitle}>المواضيع</Text>
            <FlatList
              data={topics}
              renderItem={renderTopic}
              keyExtractor={(item) => item.id}
              numColumns={3}
              contentContainerStyle={styles.topicsList}
              scrollEnabled={false} // ✅ Prevents nested scroll issues
            />
          </View>

          {/* Teachers List Header */}
          <View style={styles.teachersContainer}>
            <Text style={styles.sectionTitle}>المعلمين المفضلين</Text>

            {favorites.length === 0 ? (
              <View style={styles.noFavoritesContainer}>
                <Image
                  source={require("../../assets/noFav.png")}
                  style={styles.noFavoritesImage}
                />
                <Text style={styles.noFavoritesText}>
                  لا يوجد معلمين مفضلين
                </Text>
              </View>
            ) : (
              <FlatList
                horizontal
                data={teachersData}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={renderTeacher}
                showsHorizontalScrollIndicator={false}
                // contentContainerStyle={{ gap: -20 }}
              />
            )}
          </View>
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: "#F6F6F6",
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: "#0f0f10",
    fontSize: 16,
    marginBottom: 2,
    textAlign: "right",
    writingDirection: "rtl",
    fontFamily: "Cairo",
    fontWeight: "700",
  },
  subTitle: {
    fontSize: 13,
    color: "#009dff",
    marginBottom: 20,
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "normal",
    fontFamily: "Cairo",
  },
  topicsContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
  },

  teachersContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: "right",
    writingDirection: "rtl",
    color: "#031417",
    fontWeight: "700",
    fontFamily: "Cairo",
  },
  topicsList: {
    marginTop: 10,
  },
  topicContainer: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e4e4e4",
    margin: 5,
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 10, // ✅ Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,

    // ✅ Shadow for Android
    elevation: 3,
  },
  topicText: {
    fontSize: 14,
    marginTop: 10,
    color: "#031417",
    textAlign: "center",
    fontWeight: "semisemibold",
    fontFamily: "Cairo",
    fontWeight: "bold",
    borderRadius: 10,
  },
  teachersList: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  noFavoritesContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  noFavoritesImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#009dff",
  },
  noFavoritesText: {
    fontSize: 16,
    color: "#7D7D7D",
    fontWeight: "semisemibold",
    fontFamily: "Cairo",
  },
});

export default StudentHomeScreen;

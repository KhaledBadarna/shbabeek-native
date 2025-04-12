import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FavoriteIcon from "../../components/FavoriteIcon";
import ShareTeacherButton from "../../components/ShareTeacherButton";
// import YoutubeIframe from "react-native-youtube-iframe";

const TeacherInfoScreen = ({ route, navigation }) => {
  const { teacher, teacherId, topicName } = route.params;
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [videoReady, setVideoReady] = React.useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`;

  const handlePlay = () => setIsPlaying(true);

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.teacherDetails}
        contentContainerStyle={{ paddingBottom: 120 }} // Prevents overlap with the button
      >
        {/* Video Section */}
        {/* <View style={styles.videoContainer}>
          <YoutubeIframe
            height={200}
            videoId="dQw4w9WgXcQ"
            play={isPlaying}
            onReady={() => setVideoReady(true)}
            webViewStyle={{ backgroundColor: "black", borderRadius: 10 }}
            controls={0}
          />
          {!isPlaying && videoReady && (
            <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
              <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
              <Icon
                name="play-circle"
                size={80}
                color="#00adf0"
                style={styles.playIcon}
              />
            </TouchableOpacity>
          )}
        </View> */}

        {/* Teacher Profile */}
        <View style={styles.profileContainer}>
          <View style={styles.iconContainer}>
            <ShareTeacherButton teacherId={teacherId} />
            <FavoriteIcon teacherId={teacherId} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.teacherName}>{teacher.name}</Text>
            <Image
              source={{ uri: teacher.profileImage }}
              style={styles.profileImage}
            />
          </View>
        </View>

        {/* Ratings & Prices */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>التقييم</Text>
            <Text style={styles.infoValue}>
              <Icon name="star-outline" size={20} color="#555" />
              {teacher.rating}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>عدد التقييمات</Text>
            <Text style={styles.infoValue}>{teacher.ratingCount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>لكل 50 دقيقة</Text>
            <Text style={styles.infoValue}>{teacher.pricePerHour}₪</Text>
          </View>
        </View>

        {/* Stages */}
        <View style={styles.infoSection}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <Icon name="school-outline" size={30} color="#555" />
            <Text style={styles.sectionTitle}>المراحل</Text>
          </View>
          <View style={styles.topicsContainer}>
            {teacher.stages?.map((stage, index) => (
              <Text key={index} style={styles.topicText}>
                {stage}
              </Text>
            ))}
          </View>
        </View>

        {/* Topics */}
        <View style={styles.infoSection}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <Icon name="bookshelf" size={30} color="#555" />
            <Text style={styles.sectionTitle}>المواضيع</Text>
          </View>
          <View style={styles.topicsContainer}>
            {teacher.topics?.map((topic, index) => (
              <Text key={index} style={styles.topicText}>
                {topic}
              </Text>
            ))}
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioContainer}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <Icon name="card-account-details-outline" size={30} color="#555" />
            <Text style={styles.bioLabel}>نبذة عني </Text>
          </View>
          <Text style={styles.bioText}>{teacher.bio}</Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Booking Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bookLessonButton}
          onPress={() =>
            navigation.navigate("TeacherBookingScreen", {
              teacher,
              teacherId,
              topicName,
            })
          }
        >
          <Text style={styles.bookLessonText}>حجز درس</Text>
        </TouchableOpacity>
        <Icon
          name="email-fast-outline"
          size={35}
          color="#555"
          style={{
            borderWidth: 1.5,
            padding: 13,
            borderRadius: 5,
            borderColor: "#d9d9d9",
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  teacherDetails: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#F6F6F6",
  },
  videoContainer: {
    width: "100%",
    height: 200,
    position: "relative",
    marginTop: 10,
  },
  playButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  thumbnail: { width: "100%", height: 200, borderRadius: 10 },
  playIcon: {
    position: "absolute",
    bottom: 100,
    left: 130,
    backgroundColor: "white",
    borderRadius: 100,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    paddingVertical: 20,
    justifyContent: "space-between",
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  iconContainer: { flexDirection: "row", marginRight: 10 },
  teacherName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Cairo",
    marginRight: 10,
  },
  profileImage: { width: 80, height: 80, borderRadius: 10 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  infoItem: { alignItems: "center" },
  infoLabel: { fontSize: 10, color: "#777", fontFamily: "Cairo" },
  infoValue: {
    fontSize: 20,
    color: "#333",
    fontFamily: "Cairo",
    fontWeight: "900",
  },
  bioContainer: {
    paddingTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    marginTop: 10,
  },
  bioLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    fontFamily: "Cairo",
    textAlign: "right",
  },
  bioText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
    lineHeight: 20,
    fontFamily: "Cairo",
    textAlign: "right",
  },
  infoSection: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginTop: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    textAlign: "right",
    fontFamily: "Cairo",
    fontWeight: "700",
    color: "#333",
  },
  topicsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    paddingVertical: 10,
  },
  topicText: {
    fontSize: 13,
    color: "#333",
    fontFamily: "Cairo",
    paddingHorizontal: 15,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#f1f1f1",
  },

  /* Fixed Bottom Button */
  bottomBar: {
    flexDirection: "row-reverse",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingBottom: 50,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,

    // ✅ Shadow for Android
    elevation: 3,
  },
  bookLessonButton: {
    backgroundColor: "#00adf0",
    padding: 8,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginLeft: 10,
    borderWidth: 1.5,
  },
  bookLessonText: {
    fontSize: 18,
    color: "#333",
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
});

export default TeacherInfoScreen;

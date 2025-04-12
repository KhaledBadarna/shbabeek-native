// TeacherCard.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import FavoriteIcon from "../components/FavoriteIcon"; // Import the FavoriteIcon component
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AuthModal from "./modals/AuthModal";

const TeacherCard = ({
  name,
  price,
  rating,
  ratingCount,
  onPress,
  profileImage,
  studentGradeLevel,
  topics,
  teacherId,
  showDetails = true, // This will control the display of topics and studentGradeLevel
  customStyle = {}, // Custom styles for specific pages
}) => {
  const [registerModalVisible, setRegisterModalVisible] = useState(false);

  return (
    <View style={[styles.card]}>
      <TouchableOpacity
        style={[styles.cardContainer, showDetails ? null : customStyle]}
        onPress={onPress}
      >
        <View style={styles.favoriteIcon}>
          <FavoriteIcon teacherId={teacherId} />
        </View>
        {/* Image & Teacher Name Container */}
        <View
          style={[
            styles.imageNameContainer,
            showDetails
              ? { flexDirection: "row-reverse" }
              : {
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                },
          ]}
        >
          <Image
            source={{ uri: profileImage }}
            style={[
              styles.profileImage,
              showDetails
                ? { borderRadius: 5 }
                : {
                    borderRadius: 100,
                  },
            ]}
          />
          <View
            style={{
              marginRight: showDetails ? 20 : null,
            }}
          >
            <View
              style={[
                showDetails
                  ? { flexDirection: "row-reverse" }
                  : { alignItems: "center", justifyContent: "center" },
              ]}
            >
              <Text style={styles.cardName}>
                {name?.split(" ")[0]}{" "}
                {name?.split(" ")[1] ? name.split(" ")[1][0] + "." : ""}
              </Text>
            </View>

            {/* Price & Rating Container */}
            <View style={showDetails ? styles.priceRatingContainer : null}>
              {showDetails && (
                <View
                  style={{
                    flexDirection: "column", // Stack price and text vertically
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.cardPrice}>{price} ₪</Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#747474",
                      fontFamily: "Cairo",
                      marginTop: -10,
                    }}
                  >
                    لكل 50 دقيقة
                  </Text>
                </View>
              )}

              {/* Rating Container */}
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.ratingText}>
                  {(rating || 0).toFixed(1)}
                  <Icon name="star-outline" size={20} color="#031417" />
                </Text>
                <Text style={styles.ratingCountText}>({ratingCount || 0})</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Conditionally render Subject and Grade Level */}
        {showDetails && (
          <View style={styles.subjectContainer}>
            <View style={styles.detailItem}>
              <Icon
                style={[{ marginLeft: 5 }, styles.icons]}
                name="school-outline"
                size={20}
                color="#555"
              />
              <Text
                style={{
                  fontFamily: "Cairo",
                  fontSize: 12,
                  color: "#031417",
                  fontWeight: "700",
                }}
              >
                المراحل:
              </Text>
              {(studentGradeLevel ? studentGradeLevel.split(",") : []).map(
                (grade, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.detailsText,
                      {
                        borderRightWidth: 1, // Add border between grades, not after the last one
                        borderRightColor: "#ccc", // Border color
                        paddingRight: 15, // Space after border
                        marginRight: 5,
                      },
                    ]}
                  >
                    {grade.trim()}
                  </Text>
                )
              )}
            </View>
            <View style={styles.detailItem}>
              <Icon
                style={[{ marginLeft: 5 }, styles.icons]}
                name="bookshelf"
                size={20}
                color="#555"
              />
              <Text
                style={{
                  fontFamily: "Cairo",
                  fontSize: 12,
                  color: "#031417",
                  fontWeight: "700",
                }}
              >
                المواضيع:
              </Text>
              {(topics ? topics.split(",") : []).map((topic, index, arr) => (
                <Text
                  key={index}
                  style={[
                    styles.detailsText,
                    {
                      borderRightWidth: 1, // Add border between topics, not after the last one
                      borderRightColor: "#ccc", // Border color
                      paddingRight: 15, // Space after border
                      marginRight: 5,
                    },
                  ]}
                >
                  {topic.trim()}
                </Text>
              ))}
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Registration Modal */}
      <AuthModal
        visible={registerModalVisible}
        onClose={() => setRegisterModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardContainer: {
    backgroundColor: "#ffff",
  },
  imageNameContainer: {
    flexDirection: "row-reverse", // Ensures image comes first, followed by name
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
    paddingVertical: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: "#d2d2d2",
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#031417",
    textAlign: "right", // Align name to the left
    fontFamily: "Cairo",
    backgroundColor: "#00e5ff",
    padding: 10,
    borderRadius: 10,
  },
  priceRatingContainer: {
    width: 250,
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },

  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#031417",
    fontFamily: "Cairo",
  },

  ratingText: {
    fontSize: 16,
    color: "#031417",
    fontWeight: "700",
    fontFamily: "Cairo",
  },
  ratingCountText: {
    fontSize: 10,
    color: "#5b5b5b",
    fontFamily: "Cairo",
    marginTop: -10,
  },
  subjectContainer: { textAlign: "right" },
  detailsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    fontFamily: "Cairo",
  },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  detailItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 5,
    textAlign: "right",
  },
});

export default TeacherCard;

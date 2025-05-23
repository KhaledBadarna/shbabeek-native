import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FavoriteIcon from "./FavoriteIcon"; // ✅ Import it here

const BarberCard = ({
  name,
  profileImage,
  rating,
  ratingCount,
  onPress,
  price,
  id, // ✅ Needed for FavoriteIcon
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />

        {/* ✅ Favorite Icon */}
        <View style={styles.favoriteIcon}>
          <FavoriteIcon barberId={id} />
        </View>
      </View>

      <View style={{ width: "100%", paddingHorizontal: 10 }}>
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.subText}>location</Text>
      </View>

      <View style={styles.subView}>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>
            {(rating || 0).toFixed(1)} <Icon name="star-outline" size={16} />
          </Text>
          <Text style={styles.ratingCountText}>({ratingCount || 0})</Text>
        </View>
        <Text style={styles.priceText}>{price} ₪</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 1,
    elevation: 4,
    flexDirection: "column", // ✅ safe layout
  },

  imageWrapper: {
    width: "100%",
    position: "relative",
  },
  profileImage: {
    width: "100%",
    aspectRatio: 1.5,
    resizeMode: "cover",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 3,
    zIndex: 10,
    elevation: 3,
  },
  subText: { textAlign: "right", fontFamily: "Cairo" },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "right",
    fontFamily: "Cairo",
  },
  subView: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#e8e8e8",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    marginRight: 15,
  },
  ratingText: {
    fontSize: 13,
  },
  ratingCountText: {
    fontSize: 11,
    color: "#888",
  },
  priceText: {
    fontSize: 13,
    color: "#444",
  },
});

export default BarberCard;

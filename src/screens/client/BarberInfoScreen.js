import React, { useState } from "react";
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
import ShareBarberButton from "../../components/ShareBarberButton";
import { useNavigation } from "@react-navigation/native";
import AuthModal from "../../components/modals/AuthModal";
import { useSelector } from "react-redux";

const BarberInfoScreen = ({ route }) => {
  const { barber, barberId } = route.params;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isLoggedIn } = useSelector((state) => state.user);
  const navigation = useNavigation();

  const splitTags = (tags = []) => {
    const firstRow = tags.slice(0, 5);
    const secondRow = tags.slice(5);
    return [firstRow, secondRow];
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.barberDetails}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.profileContainer}>
          <View style={styles.iconContainer}>
            <ShareBarberButton barberId={barberId} />
            <FavoriteIcon barberId={barberId} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.barberName}>
              {(() => {
                const [first, last = ""] = barber.name.trim().split(" ");
                return `${first} ${last.charAt(0).toUpperCase()}.`;
              })()}
            </Text>
            <Image
              source={{ uri: barber.profileImage }}
              style={styles.profileImage}
            />
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>التقييم</Text>
            <Text style={styles.infoValue}>
              <Icon name="star-outline" size={20} color="#555" />
              {barber.rating || 0}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>عدد التقييمات</Text>
            <Text style={styles.infoValue}>{barber.ratingCount || 0}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>عدد الحجوزات</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>لكل حجز</Text>
            <Text style={styles.infoValue}>{barber.pricePerHour}₪</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Icon name="account-group-outline" size={20} color="#555" />
            <Text style={styles.sectionTitle}>الفئات</Text>
          </View>
          <View style={styles.tagRow}>
            {(barber.stages || []).map((stage, index) => (
              <Text key={index} style={styles.tagText}>
                {stage}
              </Text>
            ))}
          </View>
        </View>

        {/* Services */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Icon name="scissors-cutting" size={20} color="#555" />
            <Text style={styles.sectionTitle}>الخدمات</Text>
          </View>
          {splitTags(barber.topics).map((row, i) => (
            <View key={i} style={styles.tagRow}>
              {row.map((topic, j) => (
                <Text key={j} style={styles.tagText}>
                  {topic}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Booking Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bookLessonButton}
          onPress={() =>
            navigation.navigate("BarberAvailabilityScreen", {
              barber,
              barberId,
            })
          }
        >
          <Text style={styles.bookLessonText}>حجز موعد</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (!isLoggedIn) return setShowAuthModal(true);
            navigation.navigate("ChatScreen", {
              receiverId: barberId,
              barber,
            });
          }}
        >
          <Icon
            name="email-fast-outline"
            size={35}
            color="#060e1a"
            style={{
              borderWidth: 1.5,
              padding: 4,
              borderRadius: 10,
              borderColor: "#30b3ff",
            }}
          />
        </TouchableOpacity>
      </View>
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  barberDetails: { flex: 1, paddingHorizontal: 10 },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    paddingVertical: 20,
    justifyContent: "space-between",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  iconContainer: { flexDirection: "row", marginRight: 10 },
  barberName: {
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
    padding: 10,
    backgroundColor: "#ffffff",
  },
  infoItem: { alignItems: "center" },
  infoLabel: { fontSize: 10, color: "#777", fontFamily: "Cairo" },
  infoValue: {
    fontSize: 20,
    color: "#333",
    fontFamily: "Cairo",
    fontWeight: "900",
  },
  infoSection: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginTop: 10,
    padding: 10,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Cairo",
    fontWeight: "700",
    color: "#333",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 5,
  },
  tagText: {
    fontSize: 13,
    color: "#333",
    fontFamily: "Cairo",
    paddingHorizontal: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 5,
  },
  bioText: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
    lineHeight: 20,
    fontFamily: "Cairo",
    textAlign: "right",
  },
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
    elevation: 3,
  },
  bookLessonButton: {
    backgroundColor: "#009dff",
    padding: 8,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginLeft: 10,
  },
  bookLessonText: {
    fontSize: 18,
    color: "#ffffff",
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
});

export default BarberInfoScreen;

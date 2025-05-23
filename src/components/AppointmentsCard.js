import React from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
const getArabicDayName = (isoDate) => {
  const days = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  const dayIndex = new Date(isoDate).getDay();
  return days[dayIndex];
};
const formatShortDate = (dateString) => {
  if (!dateString) return "??/??";
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

const AppointmentsCard = ({ appointments = [] }) => {
  const formatName = (fullName) => {
    if (!fullName) return "";
    const [first, last = ""] = fullName.trim().split(" ");
    return `${first} ${last.charAt(0)}.`.trim();
  };

  if (!appointments || appointments.length === 0) {
    return (
      <Text style={styles.noAppointmentsText}>لا توجد مواعيد في هذا اليوم</Text>
    );
  }

  return (
    <FlatList
      horizontal
      data={appointments}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={320}
      decelerationRate="fast"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
      }}
      renderItem={({ item }) => {
        const price = typeof item.price === "number" ? item.price : "??";

        return (
          <View style={[styles.card, { width: 300, marginRight: 16 }]}>
            {/* Avatar */}
            <Image
              source={{ uri: item.oppositeUser?.profileImage || "" }}
              style={styles.avatar}
            />

            {/* Details */}
            <View style={styles.details}>
              <Text style={styles.name}>
                {formatName(item.oppositeUser?.name)}
              </Text>
              <Text style={styles.service}>{item.serviceType}</Text>

              <View style={styles.timeDateRow}>
                <Text style={styles.time}>{item.startTime}</Text>
                <View
                  style={{
                    backgroundColor: "#009dff",
                    borderRadius: 10,
                    paddingHorizontal: 5,
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.date}>
                    {getArabicDayName(item.selectedDate)} ،{" "}
                    {formatShortDate(item.selectedDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.paymentRow}>
                <Icon
                  name={item.isPaid ? "credit-card-check" : "cash"}
                  size={18}
                  color={item.isPaid ? "#1b2f72" : "#7c6e4e"}
                />
                <Text style={styles.paymentText}>
                  السعر: {price}₪ {item.isPaid ? "(مدفوع)" : "( غير مدفوع)"}
                </Text>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
    width: 300,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 14,
    marginLeft: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    fontFamily: "Cairo",
    textAlign: "right",
  },
  service: {
    fontSize: 14,
    color: "#009dff",
    fontWeight: "600",
    fontFamily: "Cairo",
    textAlign: "right",
    marginBottom: 6,
  },
  timeDateRow: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  time: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Cairo",
  },
  date: {
    fontSize: 14,
    color: "#ffffff",
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
  paymentRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  paymentText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    fontFamily: "Cairo",
  },
  noAppointmentsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    fontFamily: "Cairo",
    marginTop: 40,
    fontWeight: "bold",
  },
});

export default AppointmentsCard;

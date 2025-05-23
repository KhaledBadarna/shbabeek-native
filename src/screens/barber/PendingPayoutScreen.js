import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { firestore } from "../../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const PendingPayoutScreen = () => {
  const { userId } = useSelector((state) => state.user);
  const [appointments, setLessons] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const q = query(
          collection(firestore, "appointments"),
          where("barberId", "==", userId),
          where("isAppointmentCompleted", "==", true),
          where("isBarberPaidOut", "==", false),
          orderBy("selectedDate", "desc"),
          orderBy("startTime", "asc")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLessons(data);
        console.log("📦 Pending appointments fetched:", data.length);
      } catch (error) {
        console.error("❌ Error fetching pending payout appointments:", error);
      }
    };

    fetchAppointments();
  }, [userId]);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.infoContainer}>
        <Text style={styles.date}>{item.selectedDate}</Text>
        <Text style={styles.time}>
          {item.startTime} - {item.endTime}
        </Text>
        <Text style={styles.topic}>{item.serviceType}</Text>
      </View>
      <Text style={styles.price}>{Math.round(item.paidAmount * 0.93)} ₪</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row-reverse",
          justifyContent: "space-between",
        }}
      >
        <Icon name="calendar-clock" size={30} color="#031417" />
        <Icon name="cash-fast" size={30} color="#031417" />
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>لا يوجد دروس قيد التحويل</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  infoContainer: {
    justifyContent: "flex-end",
    paddingRight: 10,
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    color: "#031417",
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
  time: {
    fontSize: 13,
    color: "#555",
    fontFamily: "Cairo",
  },
  topic: {
    fontSize: 13,
    color: "#009dff",
    fontFamily: "Cairo",
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Cairo",
    color: "#031417",
    minWidth: 60,
    textAlign: "left",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Cairo",
    fontSize: 16,
    color: "#888",
  },
});

export default PendingPayoutScreen;

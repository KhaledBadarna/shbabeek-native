import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";

const ProfitsScreen = () => {
  const { userId } = useSelector((state) => state.user); // Get current barber ID
  const navigation = useNavigation();

  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingPayout, setPendingPayout] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const ref = doc(firestore, "barbers", userId);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const data = snapshot.data();
      setTotalEarned(data.totalEarned || 0);
      setPendingPayout(data.pendingPayout || 0);
    });

    return unsubscribe;
  }, [userId]);

  return (
    <View style={styles.container}>
      <View style={styles.noticeWrapper}>
        <Text style={styles.noticeText}>المبلغ الظاهر هو بعد خصم عمولة 7%</Text>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate("CompletedAppointmentsScreen")}
        style={styles.card}
      >
        <Icon name="cash-check" size={40} color="#009dff" style={styles.icon} />
        <Text style={styles.label}>الارباح الكلية</Text>
        <Text style={styles.amount}>{totalEarned} ₪</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("PendingPayoutLessonsScreen")}
        style={styles.card}
      >
        <Icon name="cash-fast" size={40} color="#009dff" style={styles.icon} />
        <Text style={styles.label}>المبلغ قيد التحويل</Text>
        <Text style={styles.amount}>{pendingPayout} ₪</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6", padding: 20 },
  noticeWrapper: {
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
  },
  noticeText: {
    fontSize: 14,
    fontFamily: "Cairo",
    color: "#0e0d0d",
    textAlign: "center",
    fontWeight: "bold",
  },
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
  icon: { marginBottom: 10 },
  label: {
    fontSize: 16,
    fontFamily: "Cairo",
    color: "#555",
    marginBottom: 5,
  },
  amount: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Cairo",
    color: "#031417",
  },
});

export default ProfitsScreen;

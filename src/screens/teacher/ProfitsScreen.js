import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

const ProfitsScreen = () => {
  const { totalEarned, pendingPayout } = useSelector((state) => state.teacher);

  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        // 🧠 In ProfitsScreen.js
        onPress={() => navigation.navigate("CompletedLessonsScreen")}
        style={styles.card}
      >
        <Icon name="cash-check" size={40} color="#031417" style={styles.icon} />
        <Text style={styles.label}>الارباح الكلية</Text>
        <Text style={styles.amount}>{totalEarned} ₪</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={
          () => navigation.navigate("PendingPayoutLessonsScreen") // 👈 push to a new screen
        }
        style={styles.card}
      >
        <Icon name="cash-fast" size={40} color="#031417" style={styles.icon} />
        <Text style={styles.label}>المبلغ قيد التحويل</Text>
        <Text style={styles.amount}>{pendingPayout} ₪</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    padding: 20,
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
  icon: {
    marginBottom: 10,
  },
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

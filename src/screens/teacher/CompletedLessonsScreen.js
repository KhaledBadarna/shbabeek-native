import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { firestore } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  startAfter,
  limit,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const PAGE_SIZE = 10;

const CompletedLessonsScreen = () => {
  const route = useRoute();
  const onTotalCalculated = route.params?.onTotalCalculated;
  const { userId } = useSelector((state) => state.user);

  const [lessons, setLessons] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const fetchLessons = useCallback(
    async (loadMore = false, startAfterDoc = null) => {
      if (loadMore) setLoadingMore(true);

      // Base query with filters and ordering
      let baseQuery = query(
        collection(firestore, "lessons"),
        where("teacherId", "==", userId),
        where("isLessonCompleted", "==", true),
        where("isTeacherPaidOut", "==", true),
        orderBy("selectedDate", "desc"),
        orderBy("startTime", "asc")
      );

      // Add pagination if needed
      const q =
        loadMore && startAfterDoc
          ? query(baseQuery, startAfter(startAfterDoc), limit(PAGE_SIZE))
          : query(baseQuery, limit(PAGE_SIZE));

      // Fetch the docs
      const snapshot = await getDocs(q);
      const newLessons = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (loadMore) {
        setLessons((prev) => [...prev, ...newLessons]);
      } else {
        setLessons(newLessons);

        // Calculate and pass total earned
        const total = newLessons.reduce(
          (acc, curr) => acc + Number(curr.paidAmount || 0),
          0
        );
        onTotalCalculated?.(total);
      }

      // Pagination state updates
      if (snapshot.docs.length < PAGE_SIZE) setAllLoaded(true);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setLoadingMore(false);
    },
    [userId]
  );

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.infoContainer}>
        <Text style={styles.date}>{item.selectedDate}</Text>
        <Text style={styles.time}>
          {item.startTime} - {item.endTime}
        </Text>
        <Text style={styles.topic}>{item.selectedTopic}</Text>
      </View>
      <Text style={styles.price}>{item.paidAmount || "??"} ₪</Text>
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
        <Icon name="calendar-month" size={30} color="#031417" />
        <Icon name="cash-check" size={30} color="#031417" />
      </View>

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={() => {
          if (!loadingMore && !allLoaded && lastDoc) {
            fetchLessons(true, lastDoc);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : allLoaded ? (
            <Text style={styles.endText}>لا يوجد المزيد من الدروس</Text>
          ) : null
        }
        ListEmptyComponent={
          <Text style={styles.empty}>لا يوجد دروس مكتملة</Text>
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
  endText: {
    textAlign: "center",
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#888",
    paddingVertical: 10,
  },
});

export default CompletedLessonsScreen;

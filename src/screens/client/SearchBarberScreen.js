import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import BarberCard from "../../components/BarberCard";
import { useSelector } from "react-redux";
import { firestore } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import RatingModal from "../../components/modals/RatingModal";

const ClientHomeScreen = ({ navigation }) => {
  const { name, userId, profileImage } = useSelector((state) => state.user);

  const [barbersData, setBarbersData] = useState([]);
  const [allBarbers, setAllBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortFilters, setSortFilters] = useState({
    highestRated: false,
    lowestCost: false,
  });
  const [filters, setFilters] = useState({
    haircut: true,
    beard: false,
    kids: false,
    homeVisit: false,
    todayAvailable: false,
  });
  const flatListRef = useRef(null);
  const route = useRoute();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const timeout = setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
      }, 100);

      return () => clearTimeout(timeout);
    }, [barbersData])
  );

  useFocusEffect(
    useCallback(() => {
      if (route.params?.showRating) {
        setRatingData({
          appointmentId: route.params.appointmentId,
          barberId: route.params.barberId,
          paidAmount: route.params.paidAmount,
        });
        setShowRatingModal(true);
        navigation.setParams({ showRating: false });
      }
    }, [route.params])
  );

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(firestore, "barbers"));
        const barbers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllBarbers(barbers);
        setBarbersData(barbers);
      } catch (error) {
        console.error("Error fetching barbers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBarbers();
  }, []);

  const handleBarberPress = (barber) => {
    navigation.navigate("صفحة الحلاق", {
      barber,
      barberId: barber.id,
    });
  };
  const toggleFilter = (key) => {
    setFilters((prev) => {
      const updated = { ...prev };

      if (key === "kids") {
        // If selecting "kids", uncheck haircut and beard
        updated.kids = !prev.kids;
        if (updated.kids) {
          updated.haircut = false;
          updated.beard = false;
        }
      } else if (key === "haircut" || key === "beard") {
        // If selecting haircut or beard, uncheck kids
        updated[key] = !prev[key];
        if (updated.haircut || updated.beard) {
          updated.kids = false;
        }
      } else {
        // Toggle other filters normally
        updated[key] = !prev[key];
      }

      return updated;
    });
  };

  const toggleSort = (key) => {
    setSortFilters((prev) => ({
      highestRated: key === "highestRated" ? !prev.highestRated : false,
      lowestCost: key === "lowestCost" ? !prev.lowestCost : false,
    }));
  };

  const getFilteredBarbers = () => {
    let filtered = [...allBarbers];

    if (filters.kids) {
      filtered = filtered.filter((barber) => barber.stages?.includes("أطفال"));
    }

    if (filters.todayAvailable) {
      const today = new Date();
      const dayName = today.toLocaleDateString("ar-EG", { weekday: "long" });
      filtered = filtered.filter((barber) => {
        const slots = barber.availability?.[dayName] || [];
        return slots.some((slot) => !slot.isBooked);
      });
    }

    if (sortFilters.highestRated) {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortFilters.lowestCost) {
      filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
    }

    return filtered;
  };

  const renderBarber = ({ item }) => (
    <View style={{ marginBottom: 12, width: "100%" }}>
      <BarberCard
        name={item.name}
        price={item.pricePerHour}
        rating={item.rating}
        ratingCount={item.ratingCount}
        profileImage={item.profileImage}
        onPress={() => handleBarberPress(item)}
        topics={item.topics}
        barberId={item.id}
        hasTodayAvailability={item.availabilityToday}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009dff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 10 }}>
      {/* Filters */}
      <View
        style={[
          styles.filters,
          { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" },
        ]}
      >
        {[
          { key: "haircut", label: "راس" },
          { key: "beard", label: "ذقن" },
          { key: "kids", label: "أطفال" },
          { key: "todayAvailable", label: "متاح اليوم" },
          { key: "highestRated", label: "الأعلى تقييماً", sort: true },
          { key: "lowestCost", label: "الأقل تكلفة", sort: true },
        ].map(({ key, label, sort }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterButton,
              (sort ? sortFilters[key] : filters[key]) && styles.activeFilter,
            ]}
            onPress={() => (sort ? toggleSort(key) : toggleFilter(key))}
          >
            <Text
              style={[
                styles.filterText,
                (sort ? sortFilters[key] : filters[key]) && styles.activeText,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cards */}

      <FlatList
        ref={flatListRef}
        data={getFilteredBarbers()}
        keyExtractor={(item) => item.id}
        renderItem={renderBarber}
        showsVerticalScrollIndicator={false}
        style={{ padding: 10 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filters: {
    flexWrap: "wrap",
    padding: 10,
    justifyContent: "flex-end",
    borderRadius: 10,
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  activeFilter: {
    borderWidth: 1,
    borderColor: "#009dff",
  },
  filterText: {
    color: "#8f8f8f",
    fontSize: 12,
    fontFamily: "Cairo",
  },
  activeText: {
    color: "#009dff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ClientHomeScreen;

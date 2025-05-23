import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import AuthModal from "../../components/modals/AuthModal";
import BarberCard from "../../components/BarberCard";
import AppointmentsCard from "../../components/AppointmentsCard";
import fetchAppointments from "../../utils/fetchAppointments";

const ClientHomeScreen = ({ navigation }) => {
  const { isLoggedIn, userId } = useSelector((state) => state.user);
  const [favoriteBarbers, setFavoriteBarbers] = useState([]);
  const [allBarbers, setAllBarbers] = useState([]);
  const [appointmentIndex, setAppointmentIndex] = useState(0);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const upcomingAppointments = useSelector((state) => state.appointments);
  const dispatch = useDispatch();
  useEffect(() => {
    if (isLoggedIn && userId) {
      const unsubscribe = onSnapshot(
        doc(firestore, "clients", userId),
        async (snap) => {
          const data = snap.data();
          if (data?.favorites?.length) {
            const barberDocs = await Promise.all(
              data.favorites.map((id) => getDoc(doc(firestore, "barbers", id)))
            );
            const barbers = barberDocs
              .filter((docSnap) => docSnap.exists())
              .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
            setFavoriteBarbers(barbers);
          } else {
            setFavoriteBarbers([]);
          }
        }
      );

      return () => unsubscribe();
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "barbers"), (snap) => {
      const barbers = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllBarbers(barbers);
    });
    return () => unsubscribe();
  }, []);

  const handlePressBarber = (barber) => {
    if (!isLoggedIn) return setAuthModalVisible(true);
    navigation.navigate("BarberAvailabilityScreen", {
      barber,
      barberId: barber.id,
    });
  };

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={() => (
        <>
          {!isLoggedIn && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>أهلاً بك في تطبيق الحلاقة</Text>
              <Text style={styles.sectionSubtitle}>
                سجل الدخول لحجز المواعيد ومتابعة المفضلين
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => setAuthModalVisible(true)}
              >
                <Text style={styles.loginText}>تسجيل الدخول</Text>
              </TouchableOpacity>
            </View>
          )}
          {isLoggedIn && (
            <View style={styles.appointmentSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>مواعيدك القادمة</Text>
                {upcomingAppointments.length > 0 && (
                  <Text style={styles.countText}>
                    {appointmentIndex + 1} / {upcomingAppointments.length}
                  </Text>
                )}
              </View>
              <AppointmentsCard
                appointments={upcomingAppointments}
                onIndexChange={setAppointmentIndex}
              />
            </View>
          )}
          {isLoggedIn && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>الحلاقين المفضلين</Text>
                <Text style={styles.countText}>{favoriteBarbers.length}/4</Text>
              </View>
              {favoriteBarbers.length > 0 ? (
                <FlatList
                  data={favoriteBarbers.slice(0, 4)}
                  horizontal
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10 }}
                  renderItem={({ item }) => (
                    <View style={{ width: 220, paddingBottom: 10 }}>
                      <BarberCard
                        {...item}
                        onPress={() => handlePressBarber(item)}
                      />
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.emptyText}>لا يوجد حلاقين مفضلين بعد</Text>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الحلاقين القريبين منك</Text>
            <View style={styles.barbersGrid}>
              {allBarbers.slice(0, 4).map((barber) => (
                <View key={barber.id} style={styles.barberWrapper}>
                  <BarberCard
                    {...barber}
                    onPress={() => handlePressBarber(barber)}
                  />
                </View>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("SearchBarberScreen")}
              style={styles.showMoreButton}
            >
              <Text style={styles.showMoreText}>عرض المزيد</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      data={[]}
      renderItem={null}
      ListFooterComponent={
        <AuthModal
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  section: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  appointmentSection: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Cairo",
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
    textAlign: "right",
  },
  sectionSubtitle: {
    fontFamily: "Cairo",
    fontSize: 14,
    marginBottom: 10,
    color: "#555",
    textAlign: "right",
  },
  loginButton: {
    backgroundColor: "#009dff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    borderRadius: 8,
  },
  loginText: {
    color: "#fff",
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
  emptyText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#999",
    paddingVertical: 10,
  },
  showMoreButton: {
    marginTop: 5,
    alignSelf: "center",
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#009dff",
    paddingHorizontal: 10,
  },
  showMoreText: {
    color: "#009dff",
    fontSize: 14,
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
  barbersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  barberWrapper: {
    width: "48%",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  countText: {
    fontSize: 14,
    fontFamily: "Cairo",
    color: "#009dff",
  },
});

export default ClientHomeScreen;

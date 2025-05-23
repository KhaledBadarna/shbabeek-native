import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import InfoModal from "../../components/modals/InfoModal";
import { handleAppointmentBooking } from "../../utils/handleAppointmentBooking";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PaymentMethodModal from "../../components/modals/PaymentMethodModal";
import payForAppointment from "../../utils/payForAppointment";

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
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return days[date.getDay()];
};

const getSelectedServiceKey = (service) => {
  const map = {
    راس: "hair",
    رأس: "hair",
    תספורת: "hair",
    ذقن: "beard",
    זקן: "beard",
    أطفال: "kids",
    اطفال: "kids",
    ילדים: "kids",
    "راس وذقن": "both",
    "رأس وذقن": "both",
    "ראש וזקן": "both",
  };

  const normalize = (str) => {
    if (!str || typeof str !== "string") return "";
    return str
      .trim()
      .replace(/[\u0625\u0623\u0622\u0627]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/[^\u0600-\u06FFa-zA-Z\s]/g, "")
      .toLowerCase();
  };

  return map[normalize(service)] || null;
};

const BookingScreen = ({ route }) => {
  const { selectedSlots, barberId, barber } = route.params;
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [openPaymentMEthod, setOpenPaymentMethod] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoText, setInfoText] = useState("");
  const clientId = useSelector((state) => state.user.userId);
  const defaultPaymentMethod = useSelector(
    (state) => state.user.defaultPaymentMethod
  );
  const dispatch = useDispatch();

  const totalPrice = selectedSlots.reduce((sum, slot) => {
    const key = getSelectedServiceKey(slot.serviceType);
    return sum + (barber.services?.[key] ?? 0);
  }, 0);

  const handleSend = async () => {
    try {
      if (!clientId) return alert("Client ID is required!");

      const tempAppointmentId = `appointment_${Date.now()}`;

      if (defaultPaymentMethod !== "Cash") {
        const paid = await payForAppointment(
          clientId,
          tempAppointmentId,
          totalPrice
        );
        if (!paid) return alert("فشل الدفع. ");
      }

      const result = await handleAppointmentBooking(
        barber,
        barberId,
        selectedSlots,
        null, // no longer using single selectedDate
        clientId,
        null,
        dispatch,
        tempAppointmentId,
        totalPrice,
        defaultPaymentMethod
      );

      if (result.success === false) {
        setInfoText(result.reason === "conflict" ? "وقت محجوز." : "فشل الحجز.");
        setInfoVisible(true);
        return;
      }

      setShowSuccessMessage(true);
    } catch (err) {
      console.error("Booking error:", err);
      setInfoText("خطأ مفاجئ.");
      setInfoVisible(true);
    }
  };

  const groupedByDate = selectedSlots.reduce((acc, slot) => {
    acc[slot.selectedDate] = acc[slot.selectedDate] || [];
    acc[slot.selectedDate].push(slot);
    return acc;
  }, {});

  return (
    <View style={styles.screenContainer}>
      <View style={styles.contentContainer}>
        {showSuccessMessage ? (
          <Text style={styles.successMessageText}>تم حجز الموعد بنجاح!</Text>
        ) : (
          <>
            <View style={styles.barberInfo}>
              <Image
                source={{ uri: barber.profileImage }}
                style={styles.barberImage}
              />
              <Text style={styles.barberName}>{barber.name}</Text>
            </View>

            {Object.entries(groupedByDate).map(([date, slots]) => (
              <View key={date} style={{ marginBottom: 20 }}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateText}>{getArabicDayName(date)}</Text>
                  <Text style={styles.dateText}>
                    {date.split("-")[2]}/{date.split("-")[1]}
                  </Text>
                </View>

                {slots.map((slot) => {
                  const key = getSelectedServiceKey(slot.serviceType);
                  const price = barber.services?.[key] ?? 0;
                  return (
                    <View key={slot.id} style={styles.slotRow}>
                      <Text style={styles.timeText}>
                        {slot.startTime} - {slot.endTime}
                      </Text>
                      <Text style={styles.serviceText}>{slot.serviceType}</Text>
                      <Text style={styles.priceText}>{price}₪</Text>
                    </View>
                  );
                })}
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalAmount}>{totalPrice}₪</Text>
              <Text style={styles.totalLabel}>اجمالي المبلغ</Text>
            </View>

            <TouchableOpacity
              style={styles.paymentMethodButton}
              onPress={() => setOpenPaymentMethod(true)}
            >
              <View style={styles.methodInfo}>
                <Icon
                  name={
                    defaultPaymentMethod === "Cash"
                      ? "cash"
                      : defaultPaymentMethod === "GooglePay"
                      ? "google"
                      : "apple"
                  }
                  size={20}
                  color="#031417"
                  style={{ marginLeft: 5 }}
                />
                <Text style={styles.paymentMethodText}>
                  {defaultPaymentMethod === "Cash"
                    ? "نقداً"
                    : defaultPaymentMethod === "GooglePay"
                    ? "Google Pay"
                    : "Apple Pay"}
                </Text>
              </View>
              <Text style={styles.paymentEdit}>تعديل</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {!showSuccessMessage && (
        <View style={styles.fixedPayButtonContainer}>
          <TouchableOpacity style={styles.payButton} onPress={handleSend}>
            <View style={{ flexDirection: "row-reverse" }}>
              <Text style={styles.payButtonText}>
                الدفع
                {defaultPaymentMethod === "Cash"
                  ? "نقدا"
                  : defaultPaymentMethod === "GooglePay"
                  ? "باستخدام Google Pay"
                  : "باستخدام Apple Pay"}
              </Text>
              <Icon
                name={
                  defaultPaymentMethod === "Cash"
                    ? "cash"
                    : defaultPaymentMethod === "GooglePay"
                    ? "google"
                    : "apple"
                }
                size={30}
                color="#ffffff"
              />
            </View>
          </TouchableOpacity>
        </View>
      )}

      <PaymentMethodModal
        visible={openPaymentMEthod}
        setOpenPaymentMethod={setOpenPaymentMethod}
      />

      <InfoModal
        isVisible={infoVisible}
        onClose={() => setInfoVisible(false)}
        message={infoText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  barberInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9e7e7",
  },
  barberImage: {
    width: 100,
    height: 100,
    borderRadius: 30,
  },
  barberName: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Cairo",
  },
  dateHeader: {
    backgroundColor: "#009dff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#868686",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    fontFamily: "Cairo",
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
  },
  slotRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  timeText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#031417",
    width: "35%",
    textAlign: "right",
    fontWeight: "bold",
  },
  serviceText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#009dff",
    width: "30%",
    textAlign: "center",
  },
  priceText: {
    fontFamily: "Cairo",
    fontSize: 14,
    color: "#031417",
    width: "25%",
    textAlign: "left",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    marginTop: 10,
  },
  totalLabel: {
    fontFamily: "Cairo",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalAmount: {
    fontFamily: "Cairo",
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentMethodButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  paymentMethodText: {
    fontFamily: "Cairo",
    fontSize: 15,
  },
  paymentEdit: {
    fontFamily: "Cairo",
    fontSize: 15,
    color: "#009dff",
  },
  fixedPayButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  payButton: {
    backgroundColor: "#031417",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  payButtonText: {
    fontFamily: "Cairo",
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  successMessageText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 40,
    fontFamily: "Cairo",
    color: "#009dff",
  },
  methodInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default BookingScreen;

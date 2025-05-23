// App.js (updated)
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider } from "react-redux";
import store from "./src/redux/store";
import BottomTabNavigator from "./src/components/BottomTabNavigator";
import BarberInfoScreen from "./src/screens/client/BarberInfoScreen";
import AuthModal from "./src/components/modals/AuthModal";
import BookingScreen from "./src/screens/client/BookingScreen";

import BankDetailsScreen from "./src/screens/barber/BankDetailsScreen";
import BarberSettingsScreen from "./src/screens/barber/BarberSettingsScreen";
import ProfitsScreen from "./src/screens/barber/ProfitsScreen";
import CompletedAppointmentsScreen from "./src/screens/barber/CompletedAppointmentsScreen";
import PendingPayoutScreen from "./src/screens/barber/PendingPayoutScreen";
import SearchBarberScreen from "./src/screens/client/SearchBarberScreen";
import ManageAvailabilityScreen from "./src/screens/barber/ManageAvailabilityScreen";
import BarberAvailabilityScreen from "./src/screens/client/BarberAvailabilityScreen";
import * as Notifications from "expo-notifications";
import { View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { Cairo_400Regular, Cairo_700Bold } from "@expo-google-fonts/cairo";
import { TextEncoder, TextDecoder } from "text-encoding";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const Stack = createStackNavigator();

const linking = {
  prefixes: ["shbabeek://"],
  config: {
    screens: {
      "صفحة الحلاق": "barber/:barberId",
    },
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_700Bold,
  });

  useEffect(() => {
    const setupNotifications = async () => {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("❌ Push permission not granted");
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      console.log("📱 Expo Push Token:", token.data);

      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Received in foreground:", notification);
      });

      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
      });
    };

    setupNotifications();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#ffffff",
            },
            headerTintColor: "#0a0a0a",
            headerTitleStyle: {
              fontFamily: "Cairo_400Regular",
              fontSize: 15,
            },
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen
            name="Home"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="صفحة الحلاق"
            component={BarberInfoScreen}
            options={{ title: "صفحة الحلاق" }}
          />
          <Stack.Screen
            name="AuthModal"
            component={AuthModal}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="BankDetailsScreen"
            component={BankDetailsScreen}
            options={{
              title: "الحساب البنكي",
              headerBackTitle: "رجوع",
            }}
          />
          <Stack.Screen
            name="BookingScreen"
            component={BookingScreen}
            options={{
              title: "حجز موعد",
              headerBackTitle: "رجوع",
            }}
          />

          <Stack.Screen
            name="BarberSettingsScreen"
            component={BarberSettingsScreen}
            options={{
              title: "ملف الحلاق",
              headerBackTitle: "صفحتي",
            }}
          />
          <Stack.Screen
            name="ProfitsScreen"
            component={ProfitsScreen}
            options={{
              title: "أرباحي",
              headerBackTitle: "صفحتي",
            }}
          />

          <Stack.Screen
            name="CompletedAppointmentsScreen"
            component={CompletedAppointmentsScreen}
            options={{ title: "المواعيد المدفوعة" }}
          />
          <Stack.Screen
            name="PendingPayoutScreen"
            component={PendingPayoutScreen}
            options={{ title: "المواعيد المكتملة" }}
          />
          <Stack.Screen
            name="ManageAvailabilityScreen"
            component={ManageAvailabilityScreen}
            options={{ title: "مواعيدي" }}
          />
          <Stack.Screen
            name="BarberAvailabilityScreen"
            component={BarberAvailabilityScreen}
            options={{ title: "اوقات متاحة" }}
          />
          <Stack.Screen
            name="SearchBarberScreen"
            component={SearchBarberScreen}
            options={{ title: "بحث" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

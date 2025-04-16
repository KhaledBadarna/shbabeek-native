import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider } from "react-redux";
import store from "./src/redux/store";
import BottomTabNavigator from "./src/components/BottomTabNavigator";
import TeacherInfoScreen from "./src/screens/student/TeacherInfoScreen";
import TopicTeachersScreen from "./src/screens/student/TopicTeachersScreen";
import AuthModal from "./src/components/modals/AuthModal";
import EditBioScreen from "./src/screens/teacher/EditBioScreen";
import BookingScreen from "./src/screens/student/BookingScreen";
import TeacherBookingScreen from "./src/screens/student/TeacherBookingScreen";
import BankDetailsScreen from "./src/screens/teacher/BankDetailsScreen";
import TeacherSettingsScreen from "./src/screens/teacher/TeacherSettingsScreen";
import ProfitsScreen from "./src/screens/teacher/ProfitsScreen";
import LessonCallScreen from "./src/screens/shared/LessonCallScreen";
import ChatScreen from "./src/screens/shared/ChatScreen";
import CompletedLessonsScreen from "./src/screens/teacher/CompletedLessonsScreen";
import PendingPayoutLessonsScreen from "./src/screens/teacher/PendingPayoutLessonsScreen";

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
      "صفحة المعلم": "teacher/:teacherId",
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
              fontFamily: "Cairo_400Regular", // ✅ Use loaded font
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
            name="TopicTeachersScreen"
            component={TopicTeachersScreen}
            options={({ route }) => ({
              title: `معلمي ${route.params?.topic.name || ""}`,
            })}
          />
          <Stack.Screen
            name="صفحة المعلم"
            component={TeacherInfoScreen}
            options={{ title: "صفحة المعلم" }}
          />
          <Stack.Screen
            name="AuthModal"
            component={AuthModal}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditBioScreen"
            component={EditBioScreen}
            options={{
              title: "تعديل النبذة",
              headerBackTitle: "رجوع",
            }}
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
              title: "حجز درس",
              headerBackTitle: "رجوع",
            }}
          />
          <Stack.Screen
            name="TeacherBookingScreen"
            component={TeacherBookingScreen}
            options={{
              title: "حجز درس",
              headerBackTitle: "رجوع",
            }}
          />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{
              title: "الرسائل",
              headerBackTitle: "رجوع",
            }}
          />
          <Stack.Screen
            name="TeacherSettingsScreen"
            component={TeacherSettingsScreen}
            options={{
              title: "ملف المعلم",
              headerBackTitle: "صفحتي",
            }}
          />
          <Stack.Screen
            name="ProfitsScreen"
            component={ProfitsScreen}
            options={{
              title: "ارباحي",
              headerBackTitle: "صفحتي",
            }}
          />
          <Stack.Screen
            name="LessonCallScreen"
            component={LessonCallScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CompletedLessonsScreen"
            component={CompletedLessonsScreen}
            options={{ title: "الدروس المدفوعة" }}
          />
          <Stack.Screen
            name="PendingPayoutLessonsScreen"
            component={PendingPayoutLessonsScreen}
            options={{ title: "الدروس المكتملة" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

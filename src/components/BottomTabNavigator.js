import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector, useDispatch } from "react-redux"; // Redux import

import StudentProfileScreen from "../screens/shared/StudentProfileScreen";
import { setUserInfo } from "../redux/slices/userSlice"; // Redux action
import TeacherHomeScreen from "../screens/teacher/TeacherHomeScreen";
import StudentLessonsScreen from "../screens/student/StudentLessonsScreen";

import { StatusBar } from "react-native";
import AuthModal from "../components/modals/AuthModal";

import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { firestore } from "../firebase";
import ChatsListScreen from "../screens/shared/ChatsListScreen";
import StudentHomeScreen from "../screens/student/StudentHomeScreen";
import TeacherAvailability from "../screens/teacher/TeacherAvailability";
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { isLoggedIn, userId } = useSelector((state) => state.user); // Check if user is logged in
  const userRole = useSelector((state) => state.user.userType); // Get user role (student/teacher)
  const [showAuthModal, setShowAuthModal] = useState(false); // Track AuthModal visibility
  const dispatch = useDispatch(); // Redux dispatch function
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // ✅ Listen for unread messages
    const chatsRef = collection(firestore, "chats");
    const q = query(
      chatsRef,
      where(`unread.${userId}`, ">", 0) // Check if there are unread messages for this user
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.docs.forEach((doc) => {
        const chatData = doc.data();
        totalUnread += chatData.unread?.[userId] || 0;
      });

      setUnreadCount(totalUnread);
    });

    return unsubscribe;
  }, [userId]);
  const handleProfilePress = (e) => {
    if (!isLoggedIn) {
      e.preventDefault(); // Prevent navigation
      setShowAuthModal(true); // Show AuthModal
    }
  };

  return (
    <>
      {/* Set the status bar style here */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case "الرئيسية":
                iconName = focused ? "home-account" : "home-account";
                break;
              case "دروسي":
                iconName = focused
                  ? "calendar-clock"
                  : "calendar-clock-outline";
                break;
              case "صفحتي":
                iconName = focused
                  ? "card-account-details"
                  : "card-account-details-outline";
                break;
              case "الرسائل":
                return (
                  <View>
                    <Icon
                      name={focused ? "comment-text" : "comment-text-outline"}
                      size={size}
                      color={color}
                    />
                    {unreadCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount}</Text>
                      </View>
                    )}
                  </View>
                );
                break;
              default:
                iconName = "help";
            }
            return <Icon name={iconName} size={25} color={color} />;
          },
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTintColor: "#000000",
          headerTitleStyle: {
            fontFamily: "Cairo-Regular", // ✅ Apply Cairo font
          },
          tabBarActiveTintColor: "#031417",
          tabBarInactiveTintColor: "gray",
          tabBarLabelStyle: {
            fontFamily: "Cairo-Regular", // ✅ Apply Cairo font
            fontSize: 12, // Adjust size if needed
          },
        })}
      >
        <Tab.Screen
          name="الرئيسية"
          component={
            userRole === "teacher" ? TeacherHomeScreen : StudentHomeScreen
          }
        />
        <Tab.Screen
          name="دروسي"
          component={
            userRole === "teacher" ? TeacherAvailability : StudentLessonsScreen
          }
          listeners={{
            tabPress: handleProfilePress,
          }}
        />
        <Tab.Screen
          name="الرسائل"
          component={ChatsListScreen}
          listeners={{
            tabPress: handleProfilePress,
          }}
        />
        <Tab.Screen
          name="صفحتي"
          component={StudentProfileScreen}
          listeners={{
            tabPress: handleProfilePress,
          }}
        />
      </Tab.Navigator>

      {/* AuthModal for user authentication */}
      {showAuthModal && (
        <AuthModal
          visible={showAuthModal}
          userType={userRole} // ✅ Ensure this is passed
          onClose={() => setShowAuthModal(false)} // Close modal when user cancels
          onRegisterComplete={(userData) => {
            dispatch(setUserInfo(userData)); // Store user data in Redux
            setShowAuthModal(false); // Close modal after login
          }}
        />
      )}
    </>
  );
};
const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
export default BottomTabNavigator;

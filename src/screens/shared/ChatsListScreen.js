import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { firestore } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

const ChatsListScreen = () => {
  const { userId } = useSelector((state) => state.user); // Get logged-in user
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (!userId) return;

    const chatsRef = collection(firestore, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", userId),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsList = snapshot.docs.map((doc) => {
        const chatData = doc.data();

        // ✅ Get the other user ID (Key in `users` map)
        const oppositeUserId = Object.keys(chatData.users).find(
          (id) => id !== userId
        );

        // ✅ Extract user details & attach the ID manually
        const oppositeUser = {
          id: oppositeUserId, // 🔥 Now ID is explicitly included
          ...(chatData.users[oppositeUserId] || {}), // ✅ Fetch name & image
        };

        return {
          id: doc.id,
          lastMessage: chatData.lastMessage || "لا توجد رسائل بعد",
          lastMessageTime: chatData.lastMessageTime || null,
          unreadCount: chatData.unread?.[userId] || 0, // ✅ Add unread messages count
          oppositeUser, // ✅ Now `id`, `name`, and `profileImage` are present
        };
      });

      setChats(chatsList);
    });

    return unsubscribe;
  }, [userId]);

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() =>
              navigation.navigate("ChatScreen", {
                receiverId: item.oppositeUser.id,
                teacher: item.oppositeUser, // ✅ Pass teacher data for header
              })
            }
          >
            <Image
              source={{
                uri:
                  item.oppositeUser.profileImage ||
                  "https://via.placeholder.com/50",
              }}
              style={styles.avatar}
            />
            <View style={styles.textContainer}>
              <Text style={styles.username}>
                {item.oppositeUser.name || "مستخدم مجهول"}
              </Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>

            {/* ✅ Show Red Circle for Unread Messages */}
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}

            {item.lastMessageTime && (
              <Text style={styles.timeText}>
                {new Date(
                  item.lastMessageTime.seconds * 1000
                ).toLocaleTimeString("he-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false, // 24-hour format (change to true for 12-hour)
                })}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.noChatsText}>لا توجد محادثات بعد</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  chatItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    position: "relative",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#00e5ff",
  },
  textContainer: { flex: 1 },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Cairo",
    textAlign: "right",
    marginRight: 10,
  },
  lastMessage: {
    fontSize: 14,
    color: "#555",
    textAlign: "right",
    marginRight: 10,
  },
  timeText: { fontSize: 12, color: "#888", marginLeft: 10 },
  noChatsText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
    fontFamily: "Cairo",
  },
  unreadBadge: {
    position: "absolute",
    right: 20,
    top: 10,
    backgroundColor: "red",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default ChatsListScreen;

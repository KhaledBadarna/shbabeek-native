import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { firestore } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useSelector } from "react-redux";

const ChatScreen = ({ navigation, route }) => {
  const { userId, name, profileImage } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const { receiverId, teacher } = route.params; // ✅ Extracting params correctly

  // ✅ Generate chatId based on sender & receiver (Sorted alphabetically)
  const chatId =
    userId < receiverId ? `${userId}_${receiverId}` : `${receiverId}_${userId}`;

  useEffect(() => {
    if (!userId || !receiverId) return; // Avoid errors

    const chatId =
      userId < receiverId
        ? `${userId}_${receiverId}`
        : `${receiverId}_${userId}`;

    const messagesRef = collection(firestore, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesList);

      // ✅ Fetch the chat document to check unread count
      const chatRef = doc(firestore, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        const unreadCount = chatData.unread?.[userId] || 0;

        // ✅ Only update if there are unread messages
        if (unreadCount > 0) {
          markChatAsRead(chatId);
        }
      }
    });

    return unsubscribe; // Cleanup subscription
  }, [userId, receiverId]);

  // ✅ Function to reset unread count in Firestore
  const markChatAsRead = async (chatId) => {
    if (!userId || !chatId) return;

    const chatRef = doc(firestore, "chats", chatId);

    try {
      await setDoc(
        chatRef,
        {
          unread: {
            [userId]: 0, // ✅ Correctly reset unread count
          },
        },
        { merge: true } // ✅ Prevents overwriting other fields
      );

      // ✅ Fetch immediately to verify Firestore update
      const updatedChatSnap = await getDoc(chatRef);
      console.log("🔥 Firestore after update:", updatedChatSnap.data().unread);

      console.log(`✅ Chat ${chatId} marked as read for user ${userId}`);
    } catch (error) {
      console.error("❌ Error updating unread count:", error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    if (!userId || !receiverId) return;

    setMessageText(""); // ✅ Clear input field

    const chatId =
      userId < receiverId
        ? `${userId}_${receiverId}`
        : `${receiverId}_${userId}`;

    const messagesRef = collection(firestore, "chats", chatId, "messages");

    // ✅ 1️⃣ Add a new message (DOES NOT OVERWRITE)
    await addDoc(messagesRef, {
      text: messageText,
      senderId: userId,
      receiverId: receiverId,
      createdAt: serverTimestamp(),
    });

    // ✅ 2️⃣ Read the current unread count
    const chatRef = doc(firestore, "chats", chatId);

    try {
      await setDoc(
        chatRef,
        {
          participants: [userId, receiverId],
          lastMessage: messageText,
          lastMessageTime: serverTimestamp(),
          unread: {
            [receiverId]: 1, // Default to 1 if unread doesn't exist
          },
          users: {
            [userId]: {
              name: name, // Replace with actual user name
              profileImage: profileImage, // Replace with actual image
            },
            [receiverId]: {
              name: teacher?.name || "Unknown",
              profileImage:
                teacher?.profileImage || "https://via.placeholder.com/50",
            },
          },
        },
        { merge: true } // ✅ Ensures we don’t overwrite existing data
      );
    } catch (error) {
      console.error("❌ Error updating unread count:", error);
    }
  };
  useEffect(() => {
    if (teacher) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{ uri: teacher.profileImage }}
              style={{
                width: 35,
                height: 35,
                borderRadius: 100,
                marginRight: 10, // Space between image and name
                borderWidth: 1,
                borderColor: "#007AFF",
              }}
            />
            <Text
              style={{ fontSize: 16, color: "#031417", fontFamily: "Cairo" }}
            >
              {teacher.name}
            </Text>
          </View>
        ),
      });
    }
  }, [teacher, navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Chat Messages */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            inverted
            ListEmptyComponent={() => (
              <View
                style={[styles.emptyContainer, { transform: [{ scaleY: -1 }] }]}
              >
                <Text style={styles.noMessagesText}>لا توجد رسائل بعد</Text>
                <Text style={styles.noMessagesSubText}>
                  أرسل أول رسالة لبدء المحادثة 📩
                </Text>
              </View>
            )}
            renderItem={({ item }) => {
              if (!item || !item.senderId || !item.receiverId) {
                return null; // ✅ Prevents crash if message data is missing
              }

              return (
                <View
                  style={[
                    styles.messageBubble,
                    item.senderId === userId
                      ? styles.myMessage
                      : styles.theirMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
              );
            }}
          />

          {/* Input Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="اكتب رسالة..."
              value={messageText}
              onChangeText={setMessageText}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Icon name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "flex-end",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#00e5ff",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#919191",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  timeText: {
    fontSize: 12,
    color: "#ddd",
    textAlign: "right",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#ddd",
    fontSize: 16,
    textAlign: "right",
    fontFamily: "Cairo",
  },
  sendButton: {
    backgroundColor: "#00e5ff",
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noMessagesText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    textAlign: "center",
    fontFamily: "Cairo",
  },
  noMessagesSubText: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
    textAlign: "center",
    fontFamily: "Cairo",
  },
});

export default ChatScreen;

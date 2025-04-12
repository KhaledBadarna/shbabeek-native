// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import WeeklyDateSelector from "../../components/WeeklyDateSelector";
// import BookingModal from "../../components/BookingModal";
// import { firestore } from "../../firebase";
// import { onSnapshot, doc } from "firebase/firestore";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import YoutubeIframe from "react-native-youtube-iframe";
// import FavoriteIcon from "../../components/FavoriteIcon"; // Import the FavoriteIcon component
// import ShareTeacherButton from "../../components/ShareTeacherButton";
// import SlotList from "../../components/SlotList";
// import { useSelector } from "react-redux";
// import AuthModal from "../../components/AuthModal";
// import ToggleButtons from "../../components/ToggleButtons";
// const TeacherScreen = ({ route, navigation }) => {
//   const { teacher } = route.params;
//   const teacherId = route.params.teacherId;
//   const topicName = route.params.topicName;
//   const [selectedButton, setSelectedButton] = useState("info");
//   const [selectedSlot, setSelectedSlot] = useState({ date: "", time: "" });
//   const [message, setMessage] = useState("");
//   const [attachedFile, setAttachedFile] = useState(null);
//   const [selectedDay, setSelectedDay] = useState(""); // Selected day
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(""); // For full date
//   const [isPlaying, setIsPlaying] = useState(false); // To control play state
//   const [videoReady, setVideoReady] = useState(false); // To track if the video is ready
//   const [registerModalVisible, setRegisterModalVisible] = useState(false);
//   const { isLoggedIn } = useSelector((state) => state.user);
//   // Get YouTube video thumbnail URL
//   const thumbnailUrl = `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`;
//   // Function to start the video when the play button is clicked
//   const handlePlay = () => {
//     setIsPlaying(true); // Start the video
//   };

//   const handleFilePick = async () => {
//     const result = await DocumentPicker.getDocumentAsync({});
//     if (result.type === "success") {
//       setAttachedFile(result);
//     }
//   };

//   const handleSelectDay = (dayName, date) => {
//     setSelectedDay(dayName);
//     setSelectedDate(date); // Store the full date
//   };

//   const handleBooking = () => {
//     if (!message.trim()) {
//       alert("Please enter a message.");
//       return;
//     }

//     setMessage("");
//     setAttachedFile(null);
//   };

//   const categorizeSlotByTime = (startTime) => {
//     const hour = parseInt(startTime.split(":")[0], 10); // Extract hour from startTime

//     if (hour >= 6 && hour < 12) {
//       return "الصباح";
//     } else if (hour >= 12 && hour < 18) {
//       return "الظهيرة";
//     } else {
//       return "المساء";
//     }
//   };

//   const groupSlotsByTime = (slots) => {
//     return slots.reduce((groups, slot) => {
//       const category = categorizeSlotByTime(slot.startTime);
//       if (!groups[category]) {
//         groups[category] = [];
//       }
//       groups[category].push(slot);
//       return groups;
//     }, {});
//   };

//   useEffect(() => {
//     const unsubscribe = onSnapshot(
//       doc(firestore, "teacher_availability", teacherId),
//       async (docSnapshot) => {
//         if (!docSnapshot.exists()) {
//           console.error("No such document!");
//           return;
//         }

//         const rawSlotsData = docSnapshot.data().slots || {};
//         const flattenedSlotsData = Object.entries(rawSlotsData).flatMap(
//           ([day, slotsArray]) =>
//             slotsArray.map((slot) => ({
//               ...slot,
//               day,
//             }))
//         );

//         // Filter out only "available" slots
//         const availableSlotsFiltered = flattenedSlotsData.filter(
//           (slot) => slot.isBooked == false
//         );

//         setAvailableSlots(availableSlotsFiltered); // Update the state with filtered slots
//       }
//     );

//     return () => unsubscribe();
//   }, [teacherId]);

//   return (
//     <View style={styles.container}>
//       <ToggleButtons
//         options={[
//           { label: "حجز درس", value: "lesson" },
//           { label: "نبذة عني", value: "info" },
//         ]}
//         selected={selectedButton}
//         onSelect={setSelectedButton}
//       />

//       <View style={styles.content}>
//         {selectedButton === "lesson" ? (
//           <View style={{ flex: 1 }}>
//             <WeeklyDateSelector
//               selectedDay={selectedDay}
//               onSelectDay={handleSelectDay}
//               availableSlots={availableSlots}
//             />
//             <View style={{ flex: 1 }}>
//               {/* Filter available slots by the selected day */}
//               {availableSlots.filter((slot) => slot.day === selectedDay)
//                 .length === 0 ? (
//                 <Text style={styles.noSlotsText}>
//                   لا توجد مواعيد متاحة لهذا اليوم
//                 </Text>
//               ) : (
//                 <SlotList
//                   slots={availableSlots.filter(
//                     (slot) => slot.day === selectedDay && slot.isBooked == false
//                   )}
//                   onSlotPress={(slot) => {
//                     if (!isLoggedIn) {
//                       setRegisterModalVisible(true); // ✅ Show login modal if not logged in
//                       return;
//                     }
//                     setSelectedSlot(slot);
//                     navigation.navigate("BookingScreen", {
//                       selectedSlot,
//                       selectedDate,
//                       topicName,
//                       teacherId,
//                       teacher,
//                     });
//                   }}
//                 />
//               )}
//             </View>
//           </View>
//         ) : (
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{
//               paddingBottom: 300,
//             }}
//             style={styles.teacherDetails}
//           >
//             <View style={styles.videoContainer}>
//               <YoutubeIframe
//                 height={200}
//                 videoId="dQw4w9WgXcQ"
//                 play={isPlaying}
//                 onReady={() => setVideoReady(true)}
//                 webViewStyle={{
//                   backgroundColor: "black",
//                   borderRadius: 10,
//                 }}
//                 controls={0}
//               />
//               {!isPlaying && videoReady && (
//                 <TouchableOpacity
//                   style={styles.playButton}
//                   onPress={handlePlay}
//                 >
//                   <Image
//                     source={{ uri: thumbnailUrl }}
//                     style={styles.thumbnail}
//                   />
//                   <Icon
//                     style={{
//                       bottom: 100,
//                       left: 130,
//                       backgroundColor: "white",
//                       borderRadius: 100,
//                     }}
//                     name="play-circle"
//                     size={80}
//                     color="#00adf0"
//                   />
//                 </TouchableOpacity>
//               )}
//             </View>
//             <View style={styles.profileContainer}>
//               {/* Left section with icons */}
//               <View style={styles.iconContainer}>
//                 <ShareTeacherButton teacherId={teacherId} />
//                 <FavoriteIcon teacherId={teacherId} />
//               </View>

//               {/* Teacher Name and Profile Image */}
//               <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <Text style={styles.teacherName}>
//                   {teacher.name?.split(" ")[0]}{" "}
//                   {teacher.name?.split(" ")[1]
//                     ? teacher.name.split(" ")[1].substring(0, 2) + "."
//                     : ""}
//                 </Text>
//                 <Image
//                   source={{ uri: teacher.profileImage }}
//                   style={styles.profileImage}
//                 />
//               </View>
//             </View>
//             <View style={styles.infoRow}>
//               <View style={styles.infoItem}>
//                 <Text style={styles.infoLabel}>التقييم</Text>
//                 <Text style={styles.infoValue}>
//                   <Icon name="star-outline" size={20} color="#555" />
//                   {teacher.rating}
//                 </Text>
//               </View>
//               <View style={styles.infoItem}>
//                 <Text style={styles.infoLabel}>عدد التقييمات</Text>
//                 <Text style={styles.infoValue}>{teacher.ratingCount}</Text>
//               </View>
//               <View style={styles.infoItem}>
//                 <Text style={styles.infoLabel}>لكل 50 دقيقة</Text>
//                 <Text style={styles.infoValue}>{teacher.pricePerHour}₪</Text>
//               </View>
//             </View>
//             <View
//               style={{
//                 backgroundColor: "#ffffff",
//                 borderRadius: 10,
//                 padding: 10,
//               }}
//             >
//               <View
//                 style={{
//                   flexDirection: "row-reverse",
//                   alignItems: "center",
//                 }}
//               >
//                 <Icon
//                   style={[{ marginLeft: 5 }, styles.icons]}
//                   name="school-outline"
//                   size={30}
//                   color="#555"
//                 />
//                 <Text
//                   style={{
//                     fontSize: 16,
//                     textAlign: "right",
//                     fontFamily: "Cairo",
//                     fontWeight: "700",
//                     color: "#031417",
//                   }}
//                 >
//                   المراحل
//                 </Text>
//               </View>

//               <View style={styles.gradeTopics}>
//                 {teacher.stages?.map((stage, index) => (
//                   <Text key={index} style={styles.gradeTopicsText}>
//                     {stage}
//                   </Text>
//                 ))}
//               </View>
//             </View>
//             <View
//               style={{
//                 backgroundColor: "#ffffff",
//                 borderRadius: 10,
//                 marginTop: 10,
//                 padding: 10,
//               }}
//             >
//               <View
//                 style={{ flexDirection: "row-reverse", alignItems: "center" }}
//               >
//                 <Icon
//                   style={[{ marginLeft: 5 }, styles.icons]}
//                   name="bookshelf"
//                   size={30}
//                   color="#555"
//                 />
//                 <Text
//                   style={{
//                     textAlign: "right",
//                     fontFamily: "Cairo",
//                     fontWeight: "700",
//                     fontSize: 16,
//                     color: "#031417",
//                   }}
//                 >
//                   المواضيع
//                 </Text>
//               </View>
//               <View style={styles.gradeTopics}>
//                 {teacher.topics?.map((topic, index) => (
//                   <Text key={index} style={styles.gradeTopicsText}>
//                     {topic}
//                   </Text>
//                 ))}
//               </View>
//             </View>
//             <View style={styles.bioContainer}>
//               <View
//                 style={{ flexDirection: "row-reverse", alignItems: "center" }}
//               >
//                 <Icon
//                   style={[{ marginLeft: 5 }, styles.icons]}
//                   name="card-account-details-outline"
//                   size={30}
//                   color="#555"
//                 />
//                 <Text style={styles.bioLabel}>نبذة عني </Text>
//               </View>
//               <Text style={styles.bioText}>{teacher.bio}</Text>
//             </View>
//           </ScrollView>
//         )}
//       </View>

//       <AuthModal
//         visible={registerModalVisible}
//         onClose={() => setRegisterModalVisible(false)}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#ffffff" },

//   content: {
//     flex: 1,

//     padding: 10,
//     backgroundColor: "#fff",
//   },
//   teacherDetails: {
//     flex: 1,
//     paddingHorizontal: 10,
//     backgroundColor: "#F6F6F6",
//     borderRadius: 10,
//   },

//   profileContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//     backgroundColor: "#fff",
//     paddingVertical: 20,
//     justifyContent: "space-between", // Align to the left
//     borderRadius: 10,
//     marginTop: 10,
//     paddingHorizontal: 10,
//   },
//   iconContainer: {
//     flexDirection: "row",
//     marginRight: 10, // Add space between icons and text
//   },
//   teacherName: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#031417",
//     fontFamily: "Cairo",
//     marginRight: 10,
//   },
//   profileImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 10,
//   },
//   teacherName: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#031417",
//     fontFamily: "Cairo",
//     marginRight: 10,
//   },
//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     backgroundColor: "#ffffff",
//     borderRadius: 10,
//     marginBottom: 10,
//     padding: 10,
//   },
//   infoItem: { alignItems: "center" },
//   infoLabel: {
//     fontSize: 10,
//     color: "#777",
//     fontFamily: "Cairo",
//   },
//   infoValue: {
//     fontSize: 20,
//     color: "#031417",
//     fontFamily: "Cairo",
//     fontWeight: "900",
//   },
//   gradeTopicsText: {
//     fontSize: 13,
//     color: "#031417",
//     fontFamily: "Cairo",
//     paddingHorizontal: 15,
//     borderLeftWidth: 1,
//     borderColor: "#f1f1f1",
//     borderRightWidth: 1,
//   },
//   gradeTopics: {
//     alignItems: "center",
//     flexDirection: "row-reverse",
//     justifyContent: "center",
//     paddingVertical: 40,
//     borderRadius: 10,
//   },
//   bioContainer: {
//     paddingTop: 10,
//     backgroundColor: "#ffffff",
//     borderRadius: 10,
//     marginBottom: 10,
//     padding: 10,
//     marginTop: 10,
//   },
//   bioLabel: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#031417",
//     fontFamily: "Cairo",
//     textAlign: "right",
//   },
//   bioText: {
//     fontSize: 14,
//     color: "#555",
//     marginTop: 5,
//     lineHeight: 20,
//     fontFamily: "Cairo",
//     textAlign: "right",
//   },
//   noSlotsText: {
//     fontSize: 16,
//     color: "#999",
//     fontFamily: "Cairo",
//     textAlign: "center",
//     marginTop: 40,
//   },
//   playButton: {
//     position: "absolute",
//     justifyContent: "center",
//     alignItems: "center",
//     width: "100%",
//   },
//   thumbnail: {
//     width: "100%",
//     height: 200,
//     borderRadius: 10,
//   },
//   videoContainer: {
//     width: "100%",
//     height: 200,
//     position: "relative",
//     marginTop: 10,
//   },
//   slotContainer: {
//     width: "48%", // Each slot takes up 48% of the width (leaving space for two items per row)
//     margin: "1%", // Add margin between items
//     padding: 10,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 2,
//     borderColor: "#f1f1f1",
//   },
//   categoryContainer: {
//     marginVertical: 10,
//   },
//   categoryTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#031417",
//     marginRight: 8,
//     fontFamily: "Cairo",
//   },
//   categoryHeader: { flexDirection: "row-reverse", margin: 10 },
//   slotText: {
//     color: "#031417",
//     fontSize: 13,
//     fontFamily: "Cairo",
//     fontWeight: "700",
//   },
//   icons: { backgroundColor: "#ebebeb", borderRadius: 10, padding: 5 },
// });

// export default TeacherScreen;

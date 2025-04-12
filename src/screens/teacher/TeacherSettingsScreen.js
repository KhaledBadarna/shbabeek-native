import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Topics from "../../components/Topics";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore methods
import { firestore } from "../../firebase"; // Assuming firestore is initialized
import { useSelector } from "react-redux"; // Import Redux
import { useNavigation, useRoute } from "@react-navigation/native"; // Import Navigation
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const TeacherSettingsScreen = () => {
  const navigation = useNavigation(); // Initialize navigation
  const route = useRoute(); // Initialize navigation

  const [selectedTopics, setSelectedTopics] = useState([]); // Store selected topics
  const [selectedStages, setSelectedStages] = useState([]); // Store selected stages
  const [bio, setBio] = useState(""); // Store teacher's bio
  const [price, setPrice] = useState(""); // Store price per hour
  const [isSaving, setIsSaving] = useState(false); // Track saving state
  const [hasChanges, setHasChanges] = useState(false); // Track if any data is changed
  const userId = useSelector((state) => state.user.userId); // Get user ID (unique ID) from Redux
  const teacherData = useSelector((state) => state.teacher); // ✅ Get teacher data from Redux
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [bankDetails, setBankDetails] = useState({}); // Store teacher's bio
  const activeButton = route.params?.activeButton || "details"; // ✅ Fallback to "details"

  useEffect(() => {
    if (teacherData) {
      setBio(teacherData.bio);
      setPrice(teacherData.pricePerHour);
      setSelectedTopics(teacherData.topics);
      setSelectedStages(teacherData.stages);
      setBankDetails(teacherData.bankDetails || {}); // ✅ Load bank details
    }
  }, [teacherData]); // ✅ Only update when teacherData changes

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const teacherDocRef = doc(firestore, "teachers", userId);

      // ✅ Directly use selectedTopics without filtering
      const teacherData = {
        bio,
        pricePerHour: price,
        topics: selectedTopics, // ✅ Use directly
        stages: selectedStages,
        bankDetails: bankDetails, // ✅ Add bank details
        updatedAt: new Date().toISOString(), // ✅ Convert to string before saving to Redux
      };

      console.log("📤 Final Data Being Saved to Firestore:", teacherData);

      await setDoc(teacherDocRef, teacherData, { merge: true });

      console.log("✅ Teacher data saved successfully!");
      setHasChanges(false);
    } catch (error) {
      console.error("❌ Error saving teacher data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if fields are changed
  const handleFieldChange = (field, value) => {
    if (field === "bio") {
      setBio(value);
    } else if (field === "price") {
      // ✅ Remove non-numeric characters before saving
      const numericValue = value.replace(/[^\d]/g, "");
      setPrice(numericValue);
    }

    setHasChanges(true); // Mark changes
  };

  // Handling selected topics and stages
  const handleAction = (topic) => {
    setSelectedTopics((prevSelected) => {
      if (prevSelected.includes(topic.name)) {
        return prevSelected.filter((t) => t !== topic.name); // ✅ Remove by name only
      } else {
        return [...prevSelected, topic.name]; // ✅ Store only name
      }
    });

    setHasChanges(true); // ✅ Mark changes
  };

  const handleToggleStage = (stage) => {
    setSelectedStages((prevSelected) => {
      if (prevSelected.includes(stage)) {
        return prevSelected.filter((item) => item !== stage);
      } else {
        return [...prevSelected, stage];
      }
    });
    setHasChanges(true); // Mark changes
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
        >
          <View style={styles.topicsContainer}>
            <Topics selectedTopics={selectedTopics} onPress={handleAction} />
          </View>

          <View style={styles.levelsContainer}>
            <View style={styles.titleIconCont}>
              <Text style={styles.title}>المراحل</Text>
              <Icon name="school" size={25} color="#555" />
            </View>

            <Text
              style={{
                textAlign: "right",
                color: "#b2b2b2",
                fontFamily: "Cairo",
                fontSize: 12,
              }}
            >
              يمكنك اختيار عدة مراحل
            </Text>
            <View style={styles.buttonsContainer}>
              {["ابتدائي", "اعدادي", "ثانوي"].map((stage, index) => {
                const isSelected = selectedStages.includes(stage);

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleToggleStage(stage)}
                    style={[
                      styles.button,
                      isSelected && { borderColor: "#00e5ff", borderWidth: 1 }, // ✅ Change border color when selected
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row-reverse",
                        alignItems: "center",
                      }}
                    >
                      {/* ✅ Show checkmark icon only if selected, placed to the left of the text */}
                      {isSelected && (
                        <Icon
                          name="checkbox-marked-circle"
                          size={20}
                          color="#00e5ff"
                          style={{ marginLeft: 5 }}
                        />
                      )}

                      <Text style={styles.buttonText}>{stage}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.priceContainer}>
            <View style={styles.titleIconCont}>
              <Text style={styles.title}> السعر</Text>
              <Icon name="currency-usd" size={25} color="#555" />
            </View>

            <Text
              style={{
                textAlign: "right",
                color: "#cdcdcd",
                fontFamily: "Cairo",
                fontSize: 12,
              }}
            >
              السعر لكل 50 دقيقة
            </Text>
            <TextInput
              style={styles.priceInput}
              keyboardType="numeric"
              value={isEditingPrice ? price : price ? `${price} ₪` : ""}
              onChangeText={(text) => handleFieldChange("price", text)}
              onFocus={() => setIsEditingPrice(true)} // ✅ Remove ₪ symbol
              onBlur={() => setIsEditingPrice(false)} // ✅ Add ₪ symbol back
              placeholder="بالشيقل"
            />
          </View>
          <View style={styles.bioContainer}>
            <View style={styles.titleIconCont}>
              <Text style={[styles.title, { marginBottom: 10 }]}>نبذة عني</Text>
              <Icon name="card-account-details" size={25} color="#555" />
            </View>

            <TouchableOpacity
              style={styles.bioButton}
              onPress={() =>
                navigation.navigate("EditBioScreen", {
                  bio,
                  setBio,
                  setHasChanges,
                  hasChanges,
                })
              }
            >
              <Text style={styles.bioText} numberOfLines={1}>
                {bio || "اضغط لإضافة نبذة عنك..."}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bioContainer}>
            <View style={styles.titleIconCont}>
              <Text style={[styles.title, { marginBottom: 10 }]}>
                حساب البنك
              </Text>
              <Icon name="credit-card" size={25} color="#555" />
            </View>
            <TouchableOpacity
              style={styles.bankAccount}
              onPress={() =>
                navigation.navigate("BankDetailsScreen", {
                  bankDetails,
                  setBankDetails, // ✅ Pass the setter function
                  setHasChanges,
                  hasChanges,
                })
              }
            >
              <Icon
                name="bank-plus"
                size={30}
                color="#031417"
                style={{ marginLeft: 5 }}
              />
              <Text
                style={{
                  fontFamily: "Cairo",
                  fontWeight: "600",
                  color: "#031417",
                }}
              >
                {bankDetails ? "تعديل الحساب" : "اضافة حساب"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaving && styles.savingButton, // Apply savingButton style when saving
              !hasChanges && styles.disabledButton, // Grey button when no changes
            ]}
            onPress={handleSave}
            disabled={isSaving || !hasChanges} // Disable button when saving or no changes
          >
            <View
              style={{ flexDirection: "row-reverse", alignItems: "center" }}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? "جارٍ الحفظ..." : "حفظ"}
              </Text>
              <Icon
                name="send-circle"
                size={30}
                color="#fff"
                style={{ transform: [{ rotate: "180deg" }], marginRight: 10 }} // ✅ Mirroring the icon
              />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
};

// Add styles here...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: "#F6F6F6",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#031417",
    fontFamily: "Cairo",
    textAlign: "right",
    fontWeight: "bold",
  },
  buttonsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  levelsContainer: {
    backgroundColor: "#ffffff",
    marginTop: 10,
    borderRadius: 10,
    padding: 15,
  },
  topicsContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
  },
  button: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f1f1",
  },
  selectedButton: {
    backgroundColor: "#00e5ff",
  },
  buttonText: {
    fontSize: 13,
    color: "#031417",
    fontFamily: "Cairo",
  },

  priceContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 10,
    padding: 15,
  },

  priceInput: {
    borderColor: "#f1f1f1",
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Cairo",
    padding: 15,
  },
  saveButton: {
    backgroundColor: "#00e5ff", // Grey color when disabled
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  savingButton: {
    backgroundColor: "#d3d3d3", // Grey color when saving
  },
  disabledButton: {
    backgroundColor: "#cacaca", // Grey color when no changes made
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo",
  },
  bioContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },

  bioButton: {
    borderColor: "#f1f1f1",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  bioText: {
    fontSize: 13,
    fontFamily: "Cairo",
    color: "#9d9d9d",
  },
  titleIconCont: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankAccount: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: "#00e5ff",
  },
});

export default TeacherSettingsScreen;

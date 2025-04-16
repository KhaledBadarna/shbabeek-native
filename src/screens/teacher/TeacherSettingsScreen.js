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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Topics from "../../components/Topics";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore methods
import { firestore } from "../../firebase"; // Assuming firestore is initialized
import { useSelector } from "react-redux"; // Import Redux
import { useNavigation, useRoute } from "@react-navigation/native"; // Import Navigation
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch } from "react-redux";
import { setTeacherData } from "../../redux/slices/teacherSlice"; // ✅ if not already imported
import InfoModal from "../../components/modals/InfoModal";
const TeacherSettingsScreen = () => {
  const navigation = useNavigation(); // Initialize navigation
  const route = useRoute(); // Initialize navigation
  const dispatch = useDispatch(); // ✅ add this at top

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
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoText, setInfoText] = useState("");
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
    // Validation: check all required fields
    if (
      !bio.trim() ||
      !price.trim() ||
      selectedTopics.length === 0 ||
      selectedStages.length === 0 ||
      !bankDetails?.fullName ||
      !bankDetails?.bankNumber ||
      !bankDetails?.branchBank ||
      !bankDetails?.accountNumber
    ) {
      setInfoText("يرجى ملئ جميع التفاصيل");
      setInfoVisible(true);

      return;
    }

    setIsSaving(true);
    try {
      const teacherDocRef = doc(firestore, "teachers", userId);
      const teacherData = {
        bio,
        pricePerHour: price,
        topics: selectedTopics,
        stages: selectedStages,
        bankDetails: bankDetails,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(teacherDocRef, teacherData, { merge: true });
      dispatch(setTeacherData({ ...teacherData }));
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
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, margin: 10 }}
        contentContainerStyle={{ paddingBottom: 100 }} // ⬅️ more padding here
        showsVerticalScrollIndicator={false}
      >
        {/* Topics Section */}
        <View style={styles.topicsContainer}>
          <Topics selectedTopics={selectedTopics} onPress={handleAction} />
        </View>

        {/* Stages Section */}
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
                    isSelected && {
                      borderColor: "#009dff",
                      borderWidth: 1,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row-reverse",
                      alignItems: "center",
                    }}
                  >
                    {isSelected && (
                      <Icon
                        name="checkbox-marked-circle"
                        size={20}
                        color="#009dff"
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

        {/* Price Section */}
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
            onFocus={() => setIsEditingPrice(true)}
            onBlur={() => setIsEditingPrice(false)}
            placeholder="بالشيقل"
          />
        </View>

        {/* Bio Section */}
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

        {/* Bank Details Section */}
        <View style={styles.bioContainer}>
          <View style={styles.titleIconCont}>
            <Text style={[styles.title, { marginBottom: 10 }]}>حساب البنك</Text>
            <Icon name="credit-card" size={25} color="#555" />
          </View>

          <TouchableOpacity
            style={styles.bankAccount}
            onPress={() =>
              navigation.navigate("BankDetailsScreen", {
                bankDetails,
                setBankDetails,
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
      </ScrollView>

      {/* ✅ Fixed Save Button */}
      <View style={styles.fixedBottomButton}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            isSaving && styles.savingButton,
            !hasChanges && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={isSaving || !hasChanges}
        >
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <Text style={styles.saveButtonText}>
              {isSaving ? "جارٍ الحفظ..." : "حفظ"}
            </Text>
            <Icon
              name="send-circle"
              size={30}
              color="#fff"
              style={{ transform: [{ rotate: "180deg" }], marginRight: 10 }}
            />
          </View>
        </TouchableOpacity>
      </View>
      <InfoModal
        isVisible={infoVisible}
        onClose={() => setInfoVisible(false)}
        message={infoText}
      />
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
    marginTop: 5,
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
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f1f1",
  },
  selectedButton: {
    backgroundColor: "#009dff",
  },
  buttonText: {
    fontSize: 13,
    color: "#031417",
    fontFamily: "Cairo",
  },

  priceContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 5,
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
    backgroundColor: "#009dff", // Grey color when disabled
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
  fixedBottomButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#f1f1f1",
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  bioContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 5,
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
    borderColor: "#009dff",
  },
});

export default TeacherSettingsScreen;

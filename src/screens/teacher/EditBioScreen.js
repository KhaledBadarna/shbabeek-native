import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const EditBioScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bio, setBio, setHasChanges, hasChanges } = route.params; // Get the passed params
  const [newBio, setNewBio] = useState(bio);

  // Auto-save when user presses back
  // Auto-save when user presses back
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      setBio(newBio); // Save bio before leaving
    });

    return unsubscribe; // Cleanup when unmounting
  }, [navigation, newBio, setBio]);
  // Effect to compare bio with newBio to check if changes are made
  useEffect(() => {
    // Set hasChanges to true if newBio is different from the original bio
    if (newBio !== bio) {
      setHasChanges(true);
    } else {
      if (!hasChanges) {
        setHasChanges(false);
      }
    }
  }, [newBio, bio, setHasChanges]); // Watch newBio changes and compare with original bio

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false} // ✅ Hide scrollbar
      contentContainerStyle={{ paddingBottom: 300 }}
    >
      <Text style={styles.header}>تعديل النبذة</Text>

      {/* 🔥 Toggle between Text & TextInput */}

      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={6}
        maxLength={600}
        value={newBio}
        onChangeText={setNewBio}
        placeholder="اضافة نبذة هنا"
        placeholderTextColor="#9a9a9a" // You can change this color for better visibility
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#F6F6F6",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Cairo",
    color: "#031417",
  },

  textInput: {
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 12,
    fontFamily: "Cairo",
    backgroundColor: "#fff",
    textAlign: "right",
    height: 800,
  },
  saveButton: {
    backgroundColor: "#00e5ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
});

export default EditBioScreen;

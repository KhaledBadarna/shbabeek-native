import React, { useState, useEffect } from "react";
import { View, Text, TextInput } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BankDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { bankDetails, setBankDetails, setHasChanges } = route.params; // ✅ Get state from TeacherSettingsScreen

  const [fullName, setFullName] = useState(bankDetails.fullName || "");
  const [bankNumber, setBankNumber] = useState(bankDetails.bankNumber || "");
  const [branchBank, setBranchBank] = useState(bankDetails.branchBank || "");
  const [accountNumber, setAccountNumber] = useState(
    bankDetails.accountNumber || ""
  );

  // ✅ Update parent state when user exits the screen
  const saveTemporaryData = async () => {
    const updatedBankDetails = {
      fullName,
      bankNumber,
      branchBank,
      accountNumber,
    };

    setBankDetails(updatedBankDetails); // ✅ Update state in TeacherSettingsScreen
    setHasChanges(true); // ✅ Mark as changed

    await AsyncStorage.setItem(
      "bankDetails",
      JSON.stringify(updatedBankDetails)
    ); // ✅ Save temporarily
  };

  // ✅ Save before navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "beforeRemove",
      saveTemporaryData
    );
    return unsubscribe;
  }, [fullName, bankNumber, branchBank, accountNumber]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        تفاصيل الحساب البنكي{" "}
      </Text>

      {/* Full Name Input */}
      <TextInput
        placeholder="Full Name (First & Last)"
        value={fullName}
        onChangeText={setFullName}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 15,
          borderRadius: 5,
        }}
      />

      {/* Bank Number & Branch Bank in One Row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextInput
          placeholder="Bank Number"
          value={bankNumber}
          onChangeText={(text) => {
            if (/^\d{0,2}$/.test(text)) setBankNumber(text);
          }}
          keyboardType="numeric"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            marginRight: 10,
            borderRadius: 5,
          }}
        />

        <TextInput
          placeholder="Branch Bank"
          value={branchBank}
          onChangeText={(text) => {
            if (/^\d{0,3}$/.test(text)) setBranchBank(text);
          }}
          keyboardType="numeric"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 5,
          }}
        />
      </View>

      {/* Bank Account Number */}
      <TextInput
        placeholder="Bank Account Number"
        value={accountNumber}
        onChangeText={(text) => {
          if (/^\d{0,10}$/.test(text)) setAccountNumber(text); // ✅ Allows up to 10 digits
        }}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginTop: 15,
          borderRadius: 5,
        }}
      />

      {/* ✅ No "Save" button needed. Data is stored temporarily until saved in TeacherSettingsScreen */}
    </View>
  );
};

export default BankDetailsScreen;

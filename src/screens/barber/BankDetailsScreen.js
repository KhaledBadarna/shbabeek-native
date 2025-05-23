import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BankDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { bankDetails, setBankDetails, setHasChanges } = route.params;

  const [fullName, setFullName] = useState(bankDetails.fullName || "");
  const [bankNumber, setBankNumber] = useState(bankDetails.bankNumber || "");
  const [branchBank, setBranchBank] = useState(bankDetails.branchBank || "");
  const [accountNumber, setAccountNumber] = useState(
    bankDetails.accountNumber || ""
  );

  const saveTemporaryData = async () => {
    const updatedBankDetails = {
      fullName,
      bankNumber,
      branchBank,
      accountNumber,
    };

    const isChanged =
      updatedBankDetails.fullName !== bankDetails.fullName ||
      updatedBankDetails.bankNumber !== bankDetails.bankNumber ||
      updatedBankDetails.branchBank !== bankDetails.branchBank ||
      updatedBankDetails.accountNumber !== bankDetails.accountNumber;

    if (isChanged) {
      setBankDetails(updatedBankDetails);
      setHasChanges(true);

      await AsyncStorage.setItem(
        "bankDetails",
        JSON.stringify(updatedBankDetails)
      );
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "beforeRemove",
      saveTemporaryData
    );
    return unsubscribe;
  }, [fullName, bankNumber, branchBank, accountNumber]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تفاصيل الحساب البنكي</Text>

      <TextInput
        placeholder="الاسم الكامل"
        placeholderTextColor="#999"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      <View style={styles.row}>
        <TextInput
          placeholder="رقم البنك"
          placeholderTextColor="#999"
          value={bankNumber}
          onChangeText={(text) => {
            if (/^\d{0,2}$/.test(text)) setBankNumber(text);
          }}
          keyboardType="numeric"
          style={[styles.input, { marginRight: 10, flex: 1 }]}
        />

        <TextInput
          placeholder="فرع البنك"
          placeholderTextColor="#999"
          value={branchBank}
          onChangeText={(text) => {
            if (/^\d{0,3}$/.test(text)) setBranchBank(text);
          }}
          keyboardType="numeric"
          style={[styles.input, { flex: 1 }]}
        />
      </View>

      <TextInput
        placeholder="رقم الحساب البنكي"
        placeholderTextColor="#999"
        value={accountNumber}
        onChangeText={(text) => {
          if (/^\d{0,10}$/.test(text)) setAccountNumber(text);
        }}
        keyboardType="numeric"
        style={[styles.input, { marginTop: 15 }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    fontFamily: "Cairo",
    color: "#031417",
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    fontFamily: "Cairo",
    fontSize: 15,
    textAlign: "right",
    color: "#031417",
    backgroundColor: "#f9f9f9",
    margin: 10,
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default BankDetailsScreen;

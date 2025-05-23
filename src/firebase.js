// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getFunctions } from "firebase/functions";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ NEW Firebase config (from your iOS app)
const firebaseConfig = {
  apiKey: "AIzaSyBg-MAfc4fBVmGgvZkBNvithTD-e1i7ZFM",
  authDomain: "barberappoitments.firebaseapp.com",
  projectId: "barberappoitments",
  storageBucket: "barberappoitments.appspot.com",
  messagingSenderId: "375886388287",
  appId: "1:375886388287:ios:f05d50f6868444d9b86c8a", // ← iOS App ID
};

// ✅ Initialize
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  const { getAuth } = require("firebase/auth");
  auth = getAuth(app);
}

const firestore = getFirestore(app);
const realTimeDb = getDatabase(app);
const functions = getFunctions(app);

export { auth, firestore, realTimeDb, doc, setDoc, getDoc, functions };

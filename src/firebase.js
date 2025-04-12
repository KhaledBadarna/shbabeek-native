// firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth"; // ✅ DO NOT import getAuth here

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD_DEe83-gyaV3p2i4CMo0-_kAFhvUMkIU",
  authDomain: "shbabeek-12df9.firebaseapp.com",
  projectId: "shbabeek-12df9",
  storageBucket: "shbabeek-12df9.appspot.com",
  messagingSenderId: "559597200495",
  appId: "1:559597200495:ios:4dec9997d88ffa944a199a",
};

// ✅ Initialize Firebase app once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize Auth with AsyncStorage persistence (BEFORE getAuth is ever called)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Already initialized somewhere else? Use getAuth instead
  const { getAuth } = require("firebase/auth");
  auth = getAuth(app);
}

// ✅ Init Firestore and RealtimeDB
const firestore = getFirestore(app);
const realTimeDb = getDatabase(app);

export { auth, firestore, realTimeDb, doc, setDoc, getDoc };

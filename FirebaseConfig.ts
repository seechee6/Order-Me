// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"
import { getFirestore , collection} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdpTq9_vt3oI-UFDnH9SUAggkhXZ5eMAQ",
  authDomain: "orderme1-4e881.firebaseapp.com",
  projectId: "orderme1-4e881",
  storageBucket: "orderme1-4e881.firebasestorage.app",
  messagingSenderId: "557298488720",
  appId: "1:557298488720:web:70363db5905ed282928f15",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);

export const userRef = collection(FIREBASE_DB, "users");
export const roomRef = collection(FIREBASE_DB, "rooms");
export const itemsRef = collection(FIREBASE_DB, "items");
export const cartRef = collection(FIREBASE_DB, "cart");
export const ordersRef = collection(FIREBASE_DB, "orders");


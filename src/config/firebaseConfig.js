// src/config/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence } from 'firebase/auth';
//import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  //add your firebase info
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage for persistence
const auth = getAuth(app);
auth.setPersistence(getReactNativePersistence(AsyncStorage));

// Initialize Firestore
const firestore = getFirestore(app);

export { auth, firestore };
//chalra hai

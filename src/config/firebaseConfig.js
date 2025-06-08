// src/config/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-yqP7UGa4DyuSZbrhx2aJcDs2gR-GU04",
  authDomain: "hercare-41c76.firebaseapp.com",
  projectId: "hercare-41c76",
  storageBucket: "hercare-41c76.appspot.com",
  messagingSenderId: "801251857776",
  appId: "1:801251857776:web:eb8a79a1f2cc7fb9d8abb5",
  measurementId: "G-57MESM9PC2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth and Firestore
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };

// src/firebase.tsx
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMHTGPlTrrWFXD5dCvrP43U45fQpBGBWI",
  authDomain: "fir-auth-85657.firebaseapp.com",
  projectId: "fir-auth-85657",
  storageBucket: "fir-auth-85657.appspot.com",
  messagingSenderId: "173267684445",
  appId: "1:173267684445:web:d149f39c747cb721b651b4",
  measurementId: "G-YH72HDNE17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Authentication
const db = getFirestore(app); // Initialize Firestore

export { auth, db }; // Export Auth and Firestore instances


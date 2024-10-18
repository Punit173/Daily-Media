// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyBAUhQnvst1RvP-JQfcoeR80ui4VstKK6Y",
  authDomain: "testing-88bc3.firebaseapp.com",
  databaseURL: "https://testing-88bc3-default-rtdb.firebaseio.com",
  projectId: "testing-88bc3",
  storageBucket: "testing-88bc3.appspot.com", // This is needed for Firebase Storage
  messagingSenderId: "633592353172",
  appId: "1:633592353172:web:5fa3678eacc9125a90bf81",
  measurementId: "G-DX55Q8CSS2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Firebase Storage
export const storage = getStorage(app); // Export Firebase Storage

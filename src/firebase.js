// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBGDliBoG3m5xO6NVYHuf5tzF6GUX5jbKY",
  authDomain: "chatter-a2153.firebaseapp.com",
  projectId: "chatter-a2153",
  storageBucket: "chatter-a2153.firebasestorage.app",
  messagingSenderId: "920617842433",
  appId: "1:920617842433:web:0c6387f6be67d336508d00",
  measurementId: "G-XQSL3FS0HY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { db, auth };
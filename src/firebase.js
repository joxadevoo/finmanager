import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVxUducqL-Kj_A885Q4_LBnqC0ROHRDFE",
  authDomain: "finmanager-a171f.firebaseapp.com",
  projectId: "finmanager-a171f",
  storageBucket: "finmanager-a171f.firebasestorage.app",
  messagingSenderId: "23013123659",
  appId: "1:23013123659:web:47f984dd8947327d6d0fce",
  measurementId: "G-9V860B6DVD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVOi_2-XVbqrL9R2p9yjcKPSiYKcjhhDU",
  authDomain: "invoice-website-f4a56.firebaseapp.com",
  databaseURL: "https://invoice-website-f4a56-default-rtdb.firebaseio.com/",
  projectId: "invoice-website-f4a56",
  storageBucket: "invoice-website-f4a56.firebasestorage.app",
  messagingSenderId: "919773332046",
  appId: "1:919773332046:web:131417e78cd6365604391f",
  measurementId: "G-0VFFLNLEG2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export the necessary modules
export { auth, db };

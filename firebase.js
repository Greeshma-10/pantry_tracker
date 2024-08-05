// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGsei_ewPeqh803357bbAiMnUNSjHLlgY",
  authDomain: "pantry-tracker-1d3e8.firebaseapp.com",
  projectId: "pantry-tracker-1d3e8",
  storageBucket: "pantry-tracker-1d3e8.appspot.com",
  messagingSenderId: "309940961103",
  appId: "1:309940961103:web:db336cc41f2ef65b310f3a",
  measurementId: "G-HDQVRK5ND0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const auth = getAuth(app);
export { auth, firestore };
// firebase/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

console.log("Initializing Firebase...");
const firebaseConfig = {
  apiKey: "AIzaSyAD0uOWwqogKbHwer48wMJlhdS6BefmZJY",
  authDomain: "internetbutfun.firebaseapp.com",
  projectId: "internetbutfun",
  storageBucket: "internetbutfun.firebasestorage.app",
  messagingSenderId: "804896847230",
  appId: "1:804896847230:web:b5d454b6b96d1b11432f2f",
  measurementId: "G-QS246B0GNX",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { onAuthStateChanged };
export default app;

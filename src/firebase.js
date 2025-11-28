import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDmIlkBHDaiVkGNM2ap8ehLtrfzOMrLu28",
    authDomain: "unregistration-cf4fd.firebaseapp.com",
    projectId: "unregistration-cf4fd",
    storageBucket: "unregistration-cf4fd.firebasestorage.app",
    messagingSenderId: "1009077942380",
    appId: "1:1009077942380:web:e1a178949d17afd4478049",
    measurementId: "G-ZSY85TBY28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

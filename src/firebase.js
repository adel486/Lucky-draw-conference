import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyAD4IzbYVqfrIf6rGKW0tHF1v3v7HGygUQ",
    authDomain: "lucky-draw-conference.firebaseapp.com",
    projectId: "lucky-draw-conference",
    storageBucket: "lucky-draw-conference.firebasestorage.app",
    messagingSenderId: "126183901691",
    appId: "1:126183901691:web:aee8e255d0339501cfa35e",
    measurementId: "G-YF1NWPBZ24"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

export default app;

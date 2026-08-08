import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgmDQNw1qAjMwk_UyCvrz5--QrfPZBHFI",
  authDomain: "studentos-2902f.firebaseapp.com",
  projectId: "studentos-2902f",
  storageBucket: "studentos-2902f.firebasestorage.app",
  messagingSenderId: "806365451304",
  appId: "1:806365451304:web:269f2441a16dbf2452511d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

import {initializeApp} from "firebase/app"
import {getFirestore} from "firebase/firestore"
import {getAuth} from "firebase/auth"


const firebaseConfig = {
  apiKey: "AIzaSyCjH2Iae4fEvhkhncKuLKphkcFrT3xtG5Q",
  authDomain: "taskflow-app-305e6.firebaseapp.com",
  projectId: "taskflow-app-305e6",
  storageBucket: "taskflow-app-305e6.firebasestorage.app",
  messagingSenderId: "788755700493",
  appId: "1:788755700493:web:5a1a0b737b62fde04bee44"
};


const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

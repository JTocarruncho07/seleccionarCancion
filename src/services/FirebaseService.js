import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYoPjlXtAjsizO-jCkWQhr4x6LO-xFGmM",
  authDomain: "solicitar-cancion-firebase.firebaseapp.com",
  projectId: "solicitar-cancion-firebase",
  storageBucket: "solicitar-cancion-firebase.firebasestorage.app",
  messagingSenderId: "685931835142",
  appId: "1:685931835142:web:6a0d0b106aaa5569803887",
  measurementId: "G-H6REP4MYCS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc }; 
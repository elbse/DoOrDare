// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");
const { getAuth } = require("firebase/auth");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDH6qtaEfxZIP8R6JF-oOn_z-7ZV393oeY",
  authDomain: "doordare-cd17e.firebaseapp.com",
  projectId: "doordare-cd17e",
  storageBucket: "doordare-cd17e.firebasestorage.app",
  messagingSenderId: "709633208068",
  appId: "1:709633208068:web:177cfa457b815c313faa51",
  measurementId: "G-TN0YNYT9ZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = { auth, db, storage };
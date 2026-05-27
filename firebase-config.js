const firebaseConfig = {
  apiKey: "AIzaSyB6B5yUkVdXLRh2I0g52amh2ISuE-ygess",
  authDomain: "yulink.firebaseapp.com",
  projectId: "yulink",
  storageBucket: "yulink.firebasestorage.app",
  messagingSenderId: "1016942902425",
  appId: "1:1016942902425:web:9ea65e2ffd953815b48c08",
  measurementId: "G-FSDB2742T7"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

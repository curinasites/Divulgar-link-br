const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDD_sA1Fu-_WWipHT8X3cut-TwFp6zVmyk",
    authDomain: "loja-apks.firebaseapp.com",
    databaseURL: "https://loja-apks-default-rtdb.firebaseio.com",
    projectId: "loja-apks",
    storageBucket: "loja-apks.firebasestorage.app",
    messagingSenderId: "853364224426",
    appId: "1:853364224426:web:ea57f39afc9103f25bfbd3"
};

firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();
const auth = firebase.auth();
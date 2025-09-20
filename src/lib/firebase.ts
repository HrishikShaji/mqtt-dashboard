// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCekRV0a0d-74zZud_YFi-xnhM-EoYeaAA",
	authDomain: "mqtt-73b63.firebaseapp.com",
	databaseURL: "https://mqtt-73b63-default-rtdb.firebaseio.com",
	projectId: "mqtt-73b63",
	storageBucket: "mqtt-73b63.firebasestorage.app",
	messagingSenderId: "579865071825",
	appId: "1:579865071825:web:23ad6ec5df9ad1b60fb5f0",
	measurementId: "G-V7RFS5KZXZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default app;


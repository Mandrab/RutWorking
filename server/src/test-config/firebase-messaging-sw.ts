/**
 * Despite empty, firebase may require it exists
 */

importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js')

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBlQXIMxfjDcCQZsVR7d752X2TaXXJrc_M",
    authDomain: "rutworking-fb3b3.firebaseapp.com",
    databaseURL: "https://rutworking-fb3b3.firebaseio.com",
    projectId: "rutworking-fb3b3",
    storageBucket: "rutworking-fb3b3.appspot.com",
    messagingSenderId: "936912710994",
    appId: "1:936912710994:web:6a3c55ae351665f2da5e8b"
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)
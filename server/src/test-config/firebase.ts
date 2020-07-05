import firebase from 'firebase'
//import '@firebase/messaging'

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
export let firebaseApp = firebase.initializeApp(firebaseConfig)
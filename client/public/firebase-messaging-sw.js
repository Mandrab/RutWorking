// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyBlQXIMxfjDcCQZsVR7d752X2TaXXJrc_M",
    authDomain: "rutworking-fb3b3.firebaseapp.com",
    databaseURL: "https://rutworking-fb3b3.firebaseio.com",
    projectId: "rutworking-fb3b3",
    storageBucket: "rutworking-fb3b3.appspot.com",
    messagingSenderId: "936912710994",
    appId: "1:936912710994:web:6a3c55ae351665f2da5e8b"
})

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging()

messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload)

    // Customize notification here
    const notificationTitle = 'New notification!'
    const notificationOptions = {
        body: payload.body.sender + ' say: ' + payload.body.message,
    }

    return self.registration.showNotification(notificationTitle,
        notificationOptions)
})
importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-messaging.js')

firebase.initializeApp({
    apiKey: "AIzaSyBlQXIMxfjDcCQZsVR7d752X2TaXXJrc_M",
    authDomain: "rutworking-fb3b3.firebaseapp.com",
    databaseURL: "https://rutworking-fb3b3.firebaseio.com",
    projectId: "rutworking-fb3b3",
    storageBucket: "rutworking-fb3b3.appspot.com",
    messagingSenderId: "936912710994",
    appId: "1:936912710994:web:6a3c55ae351665f2da5e8b"
})

const messaging = firebase.messaging()

messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload)
    // Customize notification here
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: 'Background Message body.',
        icon: '/firebase-logo.png'
    }

    return self.registration.showNotification(notificationTitle, notificationOptions)
})
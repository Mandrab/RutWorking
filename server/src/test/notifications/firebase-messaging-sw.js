importScripts('https://www.gstatic.com/firebasejs/5.1.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/5.1.0/firebase-messaging.js')

firebase.initializeApp({
    apiKey: "AIzaSyD0JvtDU737L2QjlEWhkUYd446v2G5FvTQ",
    authDomain: "rutworking-f724c.firebaseapp.com",
    databaseURL: "https://rutworking-f724c.firebaseio.com",
    projectId: "rutworking-f724c",
    storageBucket: "rutworking-f724c.appspot.com",
    messagingSenderId: "531000857071",
    appId: "1:531000857071:web:178bfa6e4e173e5a66261a"
})

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
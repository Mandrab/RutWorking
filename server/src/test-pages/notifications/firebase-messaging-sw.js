importScripts('https://www.gstatic.com/firebasejs/5.1.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/5.1.0/firebase-messaging.js')

firebase.initializeApp({
    'messagingSenderId': 'MY_SENDER_ID'
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
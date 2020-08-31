import { initializeApp } from 'firebase'

const app = initializeApp({
    apiKey: "AIzaSyD0JvtDU737L2QjlEWhkUYd446v2G5FvTQ",
    authDomain: "rutworking-f724c.firebaseapp.com",
    databaseURL: "https://rutworking-f724c.firebaseio.com",
    projectId: "rutworking-f724c",
    storageBucket: "rutworking-f724c.appspot.com",
    messagingSenderId: "531000857071",
    appId: "1:531000857071:web:178bfa6e4e173e5a66261a"
})

export const messaging = app.messaging()

let firebaseToken

async function setToken() {
    try {
        let newToken = await messaging.getToken()
        if (!newToken || newToken == firebaseToken) return
        firebaseToken = newToken

        await fetch('http://localhost:8080/firebase/notification', {
            headers: {
                'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('user')).token,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify({ firebaseToken: newToken })
        })
    } catch (e) { 
        if (JSON.parse(localStorage.getItem('user')) != null) {
            console.log(e);
        }
    }
}

setToken()

messaging.onTokenRefresh(setToken())
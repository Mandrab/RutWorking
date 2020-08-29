import { initializeApp } from 'firebase'

const app = initializeApp({
    apiKey: "AIzaSyBlQXIMxfjDcCQZsVR7d752X2TaXXJrc_M",
    authDomain: "rutworking-fb3b3.firebaseapp.com",
    databaseURL: "https://rutworking-fb3b3.firebaseio.com",
    projectId: "rutworking-fb3b3",
    storageBucket: "rutworking-fb3b3.appspot.com",
    messagingSenderId: "936912710994",
    appId: "1:936912710994:web:6a3c55ae351665f2da5e8b"
})

export const messaging = app.messaging()

let firebaseToken

async function setToken() {
    try {
        let newToken = await messaging.getToken()
        console.log(newToken);
        if (!newToken || newToken == firebaseToken) return
        firebaseToken = newToken

        console.log("firebase token: " + newToken)
        await fetch('http://localhost:8080/firebase/notification', {
            headers: {
                'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('user')).token, // TODO ????
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify({ firebaseToken: newToken })
        })
    } catch(e) { console.log(e) }
}

setToken()

messaging.onTokenRefresh(setToken())
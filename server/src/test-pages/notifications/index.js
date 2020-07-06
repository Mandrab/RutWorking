//'use strict'
/**
 * Firebase notifications setup
 * 
 * @author Paolo Baldini
 */
const USER = { email: 'x@y.z' }

firebase.initializeApp(/* PUT YOUR CONFIG HERE */)
const messaging = firebase.messaging()

async function notifications() {
    try {
        await messaging.requestPermission()
    } catch (err) {
        window.alert('Popup notifications will not be visible!')
        return
    }
}

messaging.onTokenRefresh(async () => {
    let refreshedToken = await messaging.getToken()

    USER.firebaseToken = refreshedToken
    console.log('Token refreshed: ' + refreshedToken)
})

messaging.onMessage(payload => { appendMessage(payload.data.sender, payload.data.message) })

// Signs-in Friendly Chat.
async function signIn() {
    let result = await fetch("http://localhost:8080/login", {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
            userEmail: 'ADMIN_EMAIL',
            password: 'ADMIN_PASSWORD'
        })
    })
    let body = await result.json()
    USER.token = body.accessToken

    USER.firebaseToken = await messaging.getToken()
    await fetch('http://localhost:8080/firebase/notification', {
        headers: {
            'Authorization': USER.token,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            firebaseToken: USER.firebaseToken
        })
    })
    //firebase.auth().signInWithCustomToken(USER.firebaseToken)

    signInButtonElement.hidden = true

    getMessages()
}

async function sendMessage() {
    if (!USER.token || !USER.firebaseToken) return console.log('Not signed!')

    let message = messageInputElement.value
    await fetch('http://localhost:8080/projects/project/modules/module/messages', {
        headers: {
            'Authorization': USER.token,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            message: message
        })
    })
}

async function getMessages() {
    let result = await fetch('http://localhost:8080/projects/project/modules/module/messages', {
        headers: { 'Authorization': USER.token },
        method: 'GET'
    })
    let body = await result.json()
    body.forEach(element => { appendMessage(element.sender, element.message) })
}

// Template for messages.
var MESSAGE_TEMPLATE =
    '<div class="message-container">' +
    '<div class="message"></div>' +
    '<div class="name"></div>' +
    '</div>'

// Displays a Message in the UI.
function appendMessage(email, body) {
    // If an element for that message does not exists yet we create it.
    var container = document.createElement('div')
    container.innerHTML = MESSAGE_TEMPLATE
    let div = container.firstChild
    messageListElement.appendChild(div)

    div.querySelector('.name').textContent = email
    var messageElement = div.querySelector('.message')
    messageElement.textContent = body
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>')

    // Show the card fading-in and scroll to view the new message.
    setTimeout(function () { div.classList.add('visible') }, 1)
    messageListElement.scrollTop = messageListElement.scrollHeight
    messageInputElement.focus()
}

// Enables or disables the submit button depending on the values of the input fields.
function toggleButton() {
    if (messageInputElement.value)
        submitButtonElement.removeAttribute('disabled')
    else
        submitButtonElement.setAttribute('disabled', 'true')
}

// Checks that the Firebase SDK has been correctly setup and configured.
if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`')
}

// Shortcuts to DOM Elements.
var messageListElement = document.getElementById('messages')
var messageFormElement = document.getElementById('message-form')
var messageInputElement = document.getElementById('message')
var submitButtonElement = document.getElementById('submit')
var signInButtonElement = document.getElementById('sign-in')
var signInSnackbarElement = document.getElementById('must-signin-snackbar')
var notificationsButton = document.getElementById('enable-notifications-button')

notificationsButton.addEventListener('click', notifications)
submitButtonElement.addEventListener('click', sendMessage)
signInButtonElement.addEventListener('click', signIn)
messageInputElement.addEventListener('keyup', toggleButton)
messageInputElement.addEventListener('change', toggleButton)
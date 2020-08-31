/**
 * Configure rutworking service to work with firebase
 * 
 * @author Paolo Baldini
 */
import admin from 'firebase-admin'
import keyData from './firebase_key.json'

admin.initializeApp({
    credential: admin.credential.cert(keyData as any),
    databaseURL: 'https://rutworking-f724c.firebaseio.com'
})
export let _admin = admin
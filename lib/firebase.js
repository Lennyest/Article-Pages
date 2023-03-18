import firebase from 'firebase/app'
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAWnuj9X0TjP7z9IA_xmWEza1wzYawSfyo",
    authDomain: "nextfire-demo-52939.firebaseapp.com",
    projectId: "nextfire-demo-52939",
    storageBucket: "nextfire-demo-52939.appspot.com",
    messagingSenderId: "326557037956",
    appId: "1:326557037956:web:2c672ec8b03569f0c659d1",
    measurementId: "G-GB4JQRQ0FL"
};
  
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
}

export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
export const fromMillis = firebase.firestore.Timestamp.fromMillis;
export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED

export const increment = firebase.firestore.FieldValue.increment

/**
 * Gets a users/{uid} document with username.
 * @param {string} username
 */

export async function getUserWithUsername(username) {
    const usersRef = firestore.collection("users");
    const query = usersRef.where("username", "==", username).limit(1);

    // Gets first value from the query and returns it.
    const userDoc = (await query.get()).docs[0];
    return userDoc 
}

/**
 * Converts a firestore document to json.
 * @param {DocumentSnapshot} doc 
 */

export function postToJSON(doc) {
    const data = doc.data();

    return {
        ...data,
        // Firestone timestamp is not serializable to JSON.
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis(),
    }
}
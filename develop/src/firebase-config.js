import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBCnYLyRDSRl8jkpAWKZmYif0ew7G7ue6c",
  authDomain: "associacao-pais.firebaseapp.com",
  databaseURL: "https://associacao-pais.firebaseio.com",
  projectId: "associacao-pais",
  storageBucket: "associacao-pais.appspot.com",
  messagingSenderId: "822286480722",
  appId: "1:822286480722:web:996d44a34a5dadc5aab68b",
  measurementId: "G-B2CDS24L10"
};

if (!firebase.apps.length) {
  // Initialize Firebase only for the first time
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();
const initDoc = firestore.doc("installations/installationDoc");
//firebase.analytics();
const firebase_auth = firebase.auth();

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = firebase.storage();

// Create a storage reference from our storage service
const storageRef = storage.ref();


export { firestore, firebase_auth, storageRef, firebase, initDoc, storage, firebaseConfig }


//var functionsURL = "https://us-central1-associacao-de-pais-prototipo.cloudfunctions.net/api/";

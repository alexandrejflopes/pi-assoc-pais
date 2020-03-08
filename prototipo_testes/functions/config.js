

// Your web app's Firebase configuration
var firebaseConfig = {
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


var firestore = firebase.firestore();
//firebase.analytics();

// Get a reference to the storage service, which is used to create references in your storage bucket
var storage = firebase.storage();

// Create a storage reference from our storage service
var storageRef = storage.ref();

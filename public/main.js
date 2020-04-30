/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes the Demo.
function Demo() {
  document.addEventListener('DOMContentLoaded', function() {
    // Shortcuts to DOM Elements.
    this.signInButton = document.getElementById('demo-sign-in-button');
    this.signInButton2 = document.getElementById('demo-sign-in-button2');
    //this.signInButton3 = document.getElementById('demo-sign-in-button3');
    this.signInButtonFb = document.getElementById('demo-sign-in-buttonFb');
    this.signInButtonFb2 = document.getElementById('demo-sign-in-buttonFb2');
    this.signInButtonFb3 = document.getElementById('demo-sign-in-buttonFb3');
    this.signOutButton = document.getElementById('demo-sign-out-button');
    this.nameContainer = document.getElementById('demo-name-container');
    this.uidContainer = document.getElementById('demo-uid-container');
    this.deleteButton = document.getElementById('demo-delete-button');
    this.profilePic = document.getElementById('demo-profile-pic');
    this.signedOutCard = document.getElementById('demo-signed-out-card');
    this.signedInCard = document.getElementById('demo-signed-in-card');

    // Bind events.
    this.signInButton.addEventListener('click', this.signIn.bind(this));
    this.signInButton2.addEventListener('click', this.signIn2.bind(this));
    //this.signInButton3.addEventListener('click', this.signIn3.bind(this));
    this.signInButtonFb.addEventListener('click', this.signInFb.bind(this));
    this.signInButtonFb2.addEventListener('click', this.signInFb2.bind(this));
    this.signInButtonFb3.addEventListener('click', this.signInFb3.bind(this));
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.deleteButton.addEventListener('click', this.deleteAccount.bind(this));
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));
    if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
    var email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    firebase.auth().signInWithEmailLink(email, window.location.href)
      .then(function(result) {
        // Clear email from storage.
        window.localStorage.removeItem('emailForSignIn');
        console.log('teste2');
      })
      .catch(function(error) {
        // Some error occurred, you can inspect the code: error.code
        // Common errors could be invalid email and invalid or expired OTPs.
    });
  }
  else {
  };
  }.bind(this));


}

// Triggered on Firebase auth state change.
Demo.prototype.onAuthStateChanged = function(user) {

  if (user) {
    this.nameContainer.innerText = user.displayName;
    this.uidContainer.innerText = user.uid;
    this.profilePic.src = user.photoURL;
    this.signedOutCard.style.display = 'none';
    this.signedInCard.style.display = 'block';
  } else {
    this.signedOutCard.style.display = 'block';
    this.signedInCard.style.display = 'none';
  }
};

// Google login
Demo.prototype.signIn = function() {
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
};


// Facebook Link
Demo.prototype.signInFb = function() {
  var provider = new firebase.auth.FacebookAuthProvider();
  var auth = firebase.auth();
  auth.currentUser.linkWithPopup(provider).then(function(result) {
  var credential = result.credential;
  var user = result.user;
}).catch(function(error) {
  // Handle Errors here.
  // ...
});
};


// Facebook login
Demo.prototype.signInFb2 = function() {
  firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider());
};

// Facebook Unlink
Demo.prototype.signInFb3 = function() {
  console.log('test');
  var user = firebase.auth().currentUser;
  
  user.unlink('facebook.com').then(function() {
  // Auth provider unlinked from account
  // ...
  }).catch(function(error) {
  // An error happened
  // ...
  });
};



Demo.prototype.signIn2 = function() {
  this.emailToSend = document.getElementById('emailtosend').value;
  var actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be whitelisted in the Firebase Console.
  url: 'https://testproject-269510.firebaseapp.com/',
  // This must be true.
  handleCodeInApp: true
};
  firebase.auth().sendSignInLinkToEmail(this.emailToSend, actionCodeSettings)
  .then(function() {
    // The link was successfully sent. Inform the user.
    // Save the email locally so you don't need to ask the user for it again
    // if they open the link on the same device.
    window.localStorage.setItem('emailForSignIn', this.emailToSend);
  })
  .catch(function(error) {
    // Some error occurred, you can inspect the code: error.code
  });
};

Demo.prototype.signIn3 = function() {
  if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
    var email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    firebase.auth().signInWithEmailLink(email, window.location.href)
      .then(function(result) {
        // Clear email from storage.
        window.localStorage.removeItem('emailForSignIn');
      })
      .catch(function(error) {
        // Some error occurred, you can inspect the code: error.code
        // Common errors could be invalid email and invalid or expired OTPs.
    });
  }
  else {
    window.alert('Link inválido');
  };
};

// Signs-out of Firebase.
Demo.prototype.signOut = function() {
  firebase.auth().signOut();
};

// Deletes the user's account.
Demo.prototype.deleteAccount = function() {
  firebase.auth().currentUser.delete().then(function() {
    window.alert('Account deleted. Check your email for a confirmation.');
  }).catch(function(error) {
    if (error.code === 'auth/requires-recent-login') {
      window.alert('You need to have recently signed-in to delete your account. Please sign-in and try again.');
      firebase.auth().signOut();
    }
  });
};

// Load the demo.
window.demo = new Demo();

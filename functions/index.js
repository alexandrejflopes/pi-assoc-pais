/**
 * Copyright 2015 Google Inc. All Rights Reserved.
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

const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
admin.initializeApp();
// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
// TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// Your company name to include in the emails
// TODO: Change this to your app or company name to customize the email sent.
const APP_NAME = 'Aplicação teste';


// Sends a welcome email to the given user.
async function sendWelcomeEmail(email, displayName) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@firebase.com>`,
    to: email,
  };

  // The user subscribed to the newsletter.
  mailOptions.subject = `Welcome to ${APP_NAME}!`;
  mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
  await mailTransport.sendMail(mailOptions);
  console.log('New welcome email sent to:', email);
  return null;
}

// Sends a goodbye email to the given user.
async function sendGoodbyeEmail(email, displayName) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@firebase.com>`,
    to: email,
  };

  // The user unsubscribed to the newsletter.
  mailOptions.subject = `Bye!`;
  mailOptions.text = `Hey ${displayName || ''}!, We confirm that we have deleted your ${APP_NAME} account.`;
  await mailTransport.sendMail(mailOptions);
  console.log('Account deletion confirmation email sent to:', email);
  return null;
}


exports.sendAuthenticationEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;

    var actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: 'https://testproject-269510.firebaseapp.com/',
    // This must be true.
    handleCodeInApp: true,
    };
    //firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
    admin.auth().generateSignInWithEmailLink(email, actionCodeSettings).then(link => {
        let message = "Olá, "+nome+"\n\nRecebemos um pedido de autenticação para a sua conta na plataforma da sua associação de pais. Para entrar, por favor clique no link abaixo.\n\nLink: "+link+"\n\nSe considera que se trata de um erro, por favor ignore este email ou contacte os órgãos sociais da associação.\n\nAtenciosamente,\nA Equipa";

        let subject = `Autenticação para associação de pais - ${APP_NAME}!`;

        response.status(204).send();
        return sendEmail(email, subject, message)
    })
    .catch(err => {
        console.log('Error creating sign in email', err);
        return response.status(405).send({"error" : err});
    });
});

exports.sendNotificationEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;
   	let message = request.query.message;

    var actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: 'https://testproject-269510.firebaseapp.com/',
    // This must be true.
    handleCodeInApp: true,
    };
    //firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
    admin.auth().generateSignInWithEmailLink(email, actionCodeSettings).then(link => {
        let subject = `Autenticação para associação de pais - ${APP_NAME}!`;

        response.status(204).send();
        return sendEmail(email, subject, message)
    })
    .catch(err => {
        console.log('Error creating sign in email', err);
        return response.status(405).send({"error" : err});
    });
});

exports.sendPositionEmail = functions.https.onRequest((request, response) => {
    let email = request.query.email;
    let nome = request.query.nome;
    let nome2 = request.query.nome2;
   	let cargo = request.query.cargo;

    var actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: 'https://testproject-269510.firebaseapp.com/',
    // This must be true.
    handleCodeInApp: true,
    };
    //firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
    admin.auth().generateSignInWithEmailLink(email, actionCodeSettings).then(link => {
        let message = "Olá, "+nome+"\n\nFoi feita um transição do cargo "+cargo+" do utilizador "+nome2+" para si. Para entrar, por favor clique no link abaixo.\n\nLink: "+link+"\n\nSe considera que se trata de um erro, por favor ignore este email ou contacte os órgãos sociais da associação.\n\nAtenciosamente,\nA Equipa";

        let subject = `Autenticação para associação de pais - ${APP_NAME}!`;

        response.status(204).send();
        return sendEmail(email, subject, message)
    })
    .catch(err => {
        console.log('Error creating sign in email', err);
        return response.status(405).send({"error" : err});
    });
});

/**
 * Função auxiliar utilizada para enviar emails
 */
async function sendEmail(email, subject, message) {
    const mailOptions = {
      from: `${APP_NAME} <noreply@firebase.com>`,
      to: email,
    };
  
    // The user subscribed to the newsletter.
    mailOptions.subject = subject;
    mailOptions.text = message;
    await mailTransport.sendMail(mailOptions);
    //console.log('New welcome email sent to:', email);
    return null;
  }
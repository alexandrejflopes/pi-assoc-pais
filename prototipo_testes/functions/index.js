const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

const cors = require('cors');
app.use(cors());

//const { firestore } = require('../develop/js/app');

admin.initializeApp();


/*const firebaseConfig = {
    apiKey: "AIzaSyBCnYLyRDSRl8jkpAWKZmYif0ew7G7ue6c",
    authDomain: "associacao-pais.firebaseapp.com",
    databaseURL: "https://associacao-pais.firebaseio.com",
    projectId: "associacao-pais",
    storageBucket: "associacao-pais.appspot.com",
    messagingSenderId: "822286480722",
    appId: "1:822286480722:web:996d44a34a5dadc5aab68b",
    measurementId: "G-B2CDS24L10"
};


const firebase = require("firebase");

firebase.initializeApp(firebaseConfig);*/



// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});


/*exports.checkInstallation = functions.https.onRequest((request, response) => {
    var initDoc = admin.firestore.get("installations/installationDoc")
        .then((doc) => {
            console.log("documento: ", parametersDoc);
            response.json({message:true});
        })
        .catch((err) => {
            response.status(500).json({error:'algo de errado não está certo :/'});
            console.error(err);
        })

});*/


// URL de base para os requests: https://associacao-pais.firebaseapp.com/api/
exports.api = functions.https.onRequest(app);


app.post("/saveDoc", (request, response) => {

    const parametersDoc = {
        assoc_name : request.body.assoc_name,
        escola_name : request.body.escola_name
    };


    admin.firestore().collection("novaCol")
        .add(parametersDoc)
        // eslint-disable-next-line promise/always-return
        .then((doc) => {
            console.log("documento: ", parametersDoc);
            response.json({message:`documento ${doc.id} guardado com sucesso!`});
        })
        .catch((err) => {
            response.status(500).json({error:err});
            console.error(err);
        })

});


app.get("/defaultUser", (request, response) => {


    admin.firestore().collection("initialConfigs").doc("defaultUser").get()
        .then((doc) => {
            console.log("documento: ", doc);
            return response.status(200).json({defaultUser : doc.data()});
        })
        .catch((err) => {
            console.error(err);
            return response.json({error:"Não funcionou: " + err});

        })

});

app.get("/assocInfo", (request, response) => {


    admin.firestore().collection("initialConfigs").doc("parameters").get()
        .then((doc) => {
            console.log("documento: ", doc);
            return response.status(200).json({associacao : doc.data()});
        })
        .catch((err) => {
            console.error(err);
            return response.json({error:"Não funcionou: " + err});

        })

});

app.get("/resetInstallation", (request, response) => {


    admin.firestore().collection("initialConfigs").doc("parameters").delete()
        // eslint-disable-next-line promise/always-return
        .then((doc) => {
            console.log("documento1: ", doc);
            console.log('parametros eliminados com sucesso');


            admin.firestore().collection("initialConfigs").doc("defaultUser").delete()
                // eslint-disable-next-line promise/always-return
                .then( (d) => {
                    console.log('defaultUser eliminado com sucesso');
                    //
                })
                .catch((err) => {
                    console.error("Não consegui eliminar o defaultUser: " + err);
                    //return response.json({error:"Não consegui eliminar o defaultUser: " + err});
                });


            //return response.json({message: "parametros eliminados com sucesso"});


        })
        // eslint-disable-next-line promise/always-return
        .then((doc) => {
            console.log("documento2: ", doc);
            //console.log('installation doc eliminado com sucesso');

            admin.firestore().collection("installations").doc("installationDoc").delete()
                // eslint-disable-next-line promise/always-return
                .then( (d) => {
                    console.log('installationDoc eliminado com sucesso');
                })
                .catch((err) => {
                    console.error(err);
                    return response.json({error:"Não consegui eliminar o installationDoc: " + err});
                });

            //return response.json({message: "Reset concluído na totalidade."});
        })
        .catch((err) => {
            console.error(err);
            return response.json({error:"Não consegui eliminar os parametros: " + err});

        });

});




app.post("/signup", (request, response) => {

    //var docRefUser = admin.firestore().doc("initialConfigs/defaultUser");

    var defaultEmail = "ricardo@email.pt";
    var defaultPassword = "pass";
    var defaultName = "Ricardo Silva";

    var defaultUser = {
        email : defaultEmail,
        nome : defaultName
    };

    admin.auth().createUserWithEmailAndPassword(request.body.email, request.body.password)
        .then( (data) => {

            admin.firestore().collection("initialConfigs")
                .add(defaultUser)
                .then((doc) => {
                    console.log("defaultUser: ", defaultUser);
                    return response.json({message:`utilizador ${doc.nome} inserido com sucesso!`});
                })
                .catch((err) => {
                    console.error(err);
                    return response.json({error:"Não funcionou: " + err});

                });

            return response.status(201).json({ message : `utilizador ${data.user.uid} criado com sucesso!`});
        })
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            //alert.log(error);
            return res.status(500).json({ errorCode : errorCode, message : error.message});

            // [END_EXCLUDE]
        });

});

/*
exports.saveDoc = functions.https.onRequest((request, response) => {
  const parametersDoc = {
    assoc_name : request.body.assoc_name,
    escola_name : request.body.escola_name
  };


  admin.firestore().collection("novaCol")
      .add(parametersDoc)
      // eslint-disable-next-line promise/always-return
      .then((doc) => {
          console.log("documento: ", parametersDoc);
          response.json({message:`documento ${doc.id} guardado com sucesso!`});
      })
      .catch((err) => {
          response.status(500).json({error:'algo de errado não está certo :/'});
          console.error(err);
      })



});
*/
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

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

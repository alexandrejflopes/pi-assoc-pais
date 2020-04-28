const functions = require('firebase-functions');

// usar o cors
const app = require('express')();
const cors = require('cors')({origin:'*'});
app.use(cors);



const {
  getCasos,
  addCaso,
  deleteCaso,
  archiveCaso,
  privacyCaso,
  updateMembrosCaso,
  addMembroCaso,
  removeMembroCaso,
  editDescricaoCaso,
  updateFullCaso,
  addCommentCaso,
  removeCommentCaso,
  editCommentCaso,
  addAnexoCaso,
  removeAnexoCaso,
  getUserAvailableCasos,
  getCaso,
  getParents,
  getParent,
  getEducandos,
  getParentsNumeroSocio,
  addCota,
  confirmarPaganteCota,
  confirmarRecetorCota,
  pagoCota,
  getCotas,
  addCotasAllUsers,
  checkPagamento,
  sendRegisterEmail,
  sendRejectedEmail,
  sendApprovedEmail,
  sendAuthenticationEmail,
  sendUserImportEmail,
  sendNotificationEmail,
  sendPositionEmail
} = require('./handlers');


app.get('/addCaso', addCaso);
app.get('/getCasos', getCasos);
app.get('/deleteCaso',deleteCaso);
app.get('/archiveCaso',archiveCaso);
app.get('/privacyCaso',privacyCaso);
app.get('/updateMembrosCaso',updateMembrosCaso);
app.get('/addMembroCaso',addMembroCaso);
app.get('/removeMembroCaso',removeMembroCaso);
app.get('/editDescricaoCaso',editDescricaoCaso);
app.get('/updateFullCaso',updateFullCaso);
app.get('/addCommentCaso',addCommentCaso);
app.get('/removeCommentCaso',removeCommentCaso);
app.get('/editCommentCaso',editCommentCaso);
app.get('/addAnexoCaso',addAnexoCaso);
app.get('/removeAnexoCaso',removeAnexoCaso);
app.get('/getUserAvailableCasos',getUserAvailableCasos);
app.get('/getCaso',getCaso);
app.get('/getParents',getParents);
app.get('/getParent',getParent);
app.get('/getEducandos',getEducandos);
app.get('/getParentsNumeroSocio',getParentsNumeroSocio);
app.get('/addCota',addCota);
app.get('/confirmarPaganteCota',confirmarPaganteCota);
app.get('/confirmarRecetorCota',confirmarRecetorCota);
app.get('/pagoCota',pagoCota);
app.get('/getCotas',getCotas);
app.get('/addCotasAllUsers',addCotasAllUsers);
app.get('/checkPagamento',checkPagamento);
app.get('/sendRegisterEmail',sendRegisterEmail);
app.get('/sendRejectedEmail',sendRejectedEmail);
app.get('/sendApprovedEmail',sendApprovedEmail);
app.get('/sendAuthenticationEmail',sendAuthenticationEmail);
app.get('/sendUserImportEmail',sendUserImportEmail);
app.get('/sendNotificationEmail',sendNotificationEmail);
app.get('/sendPositionEmail',sendPositionEmail);

// URL de base para os requests: https://us-central1-associacao-pais.cloudfunctions.net/api
exports.api = functions.https.onRequest(app);

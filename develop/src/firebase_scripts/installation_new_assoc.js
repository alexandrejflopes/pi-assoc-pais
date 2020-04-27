import {
  firestore,
  storageRef,
  initDoc,
  firebaseConfig,
} from "../firebase-config";
import firebase from "firebase";

import {getRandomInteger, getGravatarURL, defaultLogoFile, newParametersTypes, languageCode, newParametersEntities} from "../utils/general_utils";
import {jsonParamsErrorMessage, importSucessMessage, provideRequiredFieldsMessage} from "../utils/messages_strings";
const jsonErrorMessage = jsonParamsErrorMessage[languageCode];
const sucessImportMessage = importSucessMessage[languageCode];
const requiredFieldsMissingMessage = provideRequiredFieldsMessage[languageCode];

// ------------------------------------------------------------
// NEW PARAMETERS

function checkJSONparamsEntitiesAndTypes(json) {

  // check entities
  const entities = Object.keys(json).length;
  //console.log("entities -> " + Object.keys(json));
  const parentParams = json[newParametersEntities.parent[languageCode]];
  const studentParams = json[newParametersEntities.student[languageCode]];

  if(entities===2 && ((parentParams==null) || (studentParams==null))){
    // if there are 2, but one of them is null: invalid JSON
    return false;
  }

  //parentParams ? console.log("parentParams -> " + JSON.stringify(parentParams)) : console.log("parentParams -> " + parentParams);
  //studentParams ? console.log("studentParams -> " + JSON.stringify(studentParams)) : console.log("studentParams -> " + studentParams);

  if(entities === 0){ // allow no parameters, as the input field is required
    return true;
  }
  if(entities >=3){
    // only 2 entities, at max (parent and student)
    return false;
  }
  else if(1 <= entities <= 2) {
    // if none of them is parent or student: invalid JSON
    if((parentParams==null) && (studentParams==null)){
      return false;
    }
    else {
      // check parameters themselves

      /* if they exist, but have no parameters: JSON no accepted
      *   - if the user does not want parameters for either
      *     parent or student, simply does not write them in the JSON
      * */
      if(parentParams){
        if(Object.keys(parentParams).length === 0)
          return false;
      }
      if(studentParams){
        if(Object.keys(studentParams).length === 0)
          return false;
      }
      const TEXT = newParametersTypes.TEXT[languageCode];
      const INT = newParametersTypes.INT[languageCode];
      const FLOAT = newParametersTypes.FLOAT[languageCode];
      //  check parent's parameters
      if(parentParams!=null){
        const keys = Object.keys(parentParams);
        if(keys.length>0){
          for (let i = 0; i< keys.length; i++){
            const chave = keys[i];
            // if none of supported parameters: invalid JSON
            if(parentParams[chave]!==TEXT && parentParams[chave]!==INT && parentParams[chave]!==FLOAT){
              return false;
            }
          }
        }
      }
      //  check student's parameters
      if(studentParams!=null){
        const keys = Object.keys(studentParams);
        if(keys.length>0){
          for (let i = 0; i< keys.length; i++){
            const chave = keys[i];
            // if none of supported parameters: invalid JSON
            if(studentParams[chave]!==TEXT && studentParams[chave]!==INT && studentParams[chave]!==FLOAT){
              return false;
            }
          }
        }
      }
    }
  }

  return true;

}

function getAndSaveJSONparamsData(jsonfile, callback) {
  // callback will be the rest of the installation
  let reader = new FileReader();
  let fileString = "NR";

  reader.onloadend = function () {
    fileString = reader.result;
    let jsonCorrect = false; // control if there were problems with JSON or not
    try{
      const json = JSON.parse(fileString);
      jsonCorrect = true;
      if(checkJSONparamsEntitiesAndTypes(json)){
        jsonCorrect = true;
        saveNewParamsFromJSONToDB(json);
        callback(jsonCorrect);
      }
      else{
        jsonCorrect = false;
        callback(jsonCorrect);
      }
    }
    catch (e) {
      jsonCorrect = false;
      callback(jsonCorrect);
    }

  };

  reader.readAsText(jsonfile, "UTF-8");
}

/*
 * receives a JSON object and saves it to Firestore
 * */
function saveNewParamsFromJSONToDB(json) {
  const paramsDoc = json;
  const docRef = firestore.doc("initialConfigs/newParameters");
  docRef
    .set(paramsDoc)
    .then(function () {
      //console.log("Novos parâmetros guardados com sucesso.");
    })
    .catch(function (error) {
      alert("Erro: " + error);
    });
}


// --------- USER

// TODO: remove after authentication has been strongly implemented
function createDefaultUser() {
  const docRefUser = firestore.doc("initialConfigs/defaultUser");

  const defaultEmail = "dgomes@pi-assoc-pais.com";
  const defaultPassword = "pass";
  const defaultName = "Diogo Gomes";

  const defaultUser = {
    email: defaultEmail,
    password: defaultPassword,
    nome: defaultName,
  };

  docRefUser
    .set(defaultUser)
    .then(function () {
      //console.log("defaultUserDoc -> ", defaultUser);
    })
    .catch(function (error) {
      alert("Erro: " + error);
    });
}

// -------------- person that installs --------------

function createInstallerParent(nome, email) {
  const docRef = firestore.collection("parents");
  let parentDoc = {};
  const numSocio = getRandomInteger(10000,100000);
  parentDoc["Admin"] = true;
  parentDoc["Cargo"] = "";
  parentDoc["Cartão Cidadão"] = "";
  parentDoc["Cotas"] = [];
  parentDoc["Código Postal"] = "";
  parentDoc["Data inscricao"] = new Date().toJSON().split("T")[0]; // get date on format: 2015-03-25
  // adicionar array para educandos
  parentDoc["Educandos"] = [];
  parentDoc["Email"] = email;
  parentDoc["Localidade"] = "";
  parentDoc["Morada"] = "";
  parentDoc["NIF"] = "";
  parentDoc["Nome"] = nome;
  parentDoc["Número de Sócio"] = numSocio;
  parentDoc["Profissão"] = "";
  parentDoc["Quotas pagas"] = "";
  parentDoc["Telemóvel"] = "";
  parentDoc["Validated"] = true; // imported parents are validated
  parentDoc["blocked"] = false; // imported parents are not blocked initially
  // avatar
  parentDoc["photo"] = getGravatarURL(email);

  const parentRef = docRef.doc(email); // email as document id

  parentRef
    .set(parentDoc)
    .then(function () {
      //console.log("EE e educandos guardados com sucesso.");
    })
    .catch(function (error) {
      alert("Erro: " + error);
    });
}

/*
 * send email to parent to notify it was imported to platform
 */
async function sendImportEmailToParent(nome, email) {
  // TODO: remove this hardcoded email
  const tempEmail = "alexandrejflopes@ua.pt";

  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/sendUserImportEmail?" +
    "email=" +
    tempEmail +
    "&" +
    "nome=" +
    nome;

  const request = async () => {
    await fetch(uri)
      .then()
      .catch(function (error) {
        console.log("Error sending import email: " + error);
      });
  };

  return request();
}

// ------------------------------------------------


// --------- upload logos ---------

function uploadDefaultLogo() {
  // if no logo is provided, consider the default
  const defaultLogoFileParts = defaultLogoFile.split("/");
  const defaultLogoFileName =
    defaultLogoFileParts[defaultLogoFileParts.length - 1];
  // get just name and extension (because the name above was like 'name.<some_numbers>.<extension>'....
  const fileNameParts = defaultLogoFileName.split(".");
  const nome = fileNameParts[0];
  const ext = fileNameParts[fileNameParts.length - 1];
  const filename = nome + "." + ext;
  return storageRef.child("logo/default/" + filename).getDownloadURL();
}

function uploadNewLogo(file) {
  const logoRef = storageRef.child("logo/" + file.name);
  return logoRef.put(file);
}

// --------------------------------

function uploadAssocDataFiles(inputID) {
  const file = document.getElementById(inputID).files[0];

  storageRef
    .child("assoc_config_files/" + file.name)
    .put(file)
    .then(function (snapshot) {
      //alert("Uploaded a blob or file!");
    })
    .catch(function (error) {
      alert(error);
    });
}

function getFormElementsAndValues() {
  const all_labels = Array.from(document.querySelectorAll("label"));
  let all_inputs = Array.from(document.querySelectorAll("input"));
  all_inputs.push(document.querySelector("#configAssocDescricao")); // add description textarea
  let submittedInputs = {};

  for (let i = 0; i < all_labels.length; i++) {
    for (let j = 0; j < all_inputs.length; j++) {
      const label = all_labels[i];
      const input = all_inputs[j];

      let labelText = label.innerText;
      let labelHtmlFor = label.htmlFor;
      let inputId = input.id;

      if (labelHtmlFor === inputId) {
        if (labelText.includes("(") || labelText.includes("/")) {
          labelText = labelText.split(" ")[0];
        }
        submittedInputs[labelText] = input;

        break;
      }
    }
  }


  return submittedInputs;
}

function removeAllInvalidFeedbacks() {
  const feedbacks = Array.from(document.querySelectorAll(".invalid-feedback"));
  const inputs = Array.from(document.querySelectorAll("input"));

  for (let i = 0; i < feedbacks.length; i++) {
    feedbacks[i].style.display = "none";
  }

  for (let i = 0; i < inputs.length; i++) {
    //console.log("input a remover atual -> ", inputs);
    if (inputs[i].classList.contains("is-invalid")) {
      //console.log("remover invalid de ", inputs[i]);
      inputs[i].classList.remove("is-invalid");
    }
  }
}


function install() {
  removeAllInvalidFeedbacks();
  let requiredFieldsProvided = true;
  let policyCheckboxChecked = true;
  const inputsInfo = getFormElementsAndValues(); // { "labelText" : input }

  for (const label in inputsInfo) {
    let input = inputsInfo[label];
    if (input.value === "" && input.required) {
      input.classList.add("is-invalid");
      document.querySelector("#" + input.id + "Feedback").style.display =
        "block";
      requiredFieldsProvided = false; // if there's an empty required input, no submit
      //break;
    }
  }

  // verify the checkBox
  const policyCheckbox = document.querySelector("input[type=checkbox]");
  if (!policyCheckbox.checked) {
    policyCheckboxChecked = false;
    document.querySelector("#" + policyCheckbox.id + "Feedback").style.display =
      "block";
  }

  if (requiredFieldsProvided && policyCheckboxChecked) {
    // read files and save their data
    const paramsJSONfile = document.getElementById("configAssocNewParams").files[0];

    getAndSaveJSONparamsData(paramsJSONfile, function (jsonCorrect) {
      if(!jsonCorrect){
        // if there's an error with JSON, not allow to submit the form
        const paramsInput = document.getElementById("configAssocNewParams");
        paramsInput.classList.add("is-invalid");
        document.querySelector("#" + paramsInput.id + "Feedback").style.display =
          "block";
        paramsInput.value = "";
        alert(jsonErrorMessage);
      }
      else{
        // uploads after files are validated
        uploadAssocDataFiles("configAssocNewParams");

        const fileArray = document.getElementById("configAssocLogo").files;

        if (fileArray.length !== 0) {
          const file = fileArray[0]; // just one logo is uploaded
          const uploadTask = uploadNewLogo(file);
          uploadTask.on(
            "state_changed",
            function (snapshot) {
              // Observe state change events such as progress, pause, and resume
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
              var progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log("Upload " + progress + "% completed");
              switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  console.log("Upload on pause");
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  console.log("Upload in progress");
                  break;
              }
            },
            function (error) {
              console.log("Upload failed: " + error);
            },
            function () {
              // Handle successful uploads on complete
              // get the download URL
              uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                continueInstallation(inputsInfo, downloadURL);
              });
            }
          );
        } else if (fileArray.length === 0) {
          const defaultLogoTask = uploadDefaultLogo();
          defaultLogoTask.then(function (downloadURL) {
            continueInstallation(inputsInfo, downloadURL);
          });
        }
      }

    });

  } else alert(requiredFieldsMissingMessage);
}

function continueInstallation(inputsInfo, logoURL) {
  const setupDataDoc = () => {
    let temp = {};
    for (const label in inputsInfo) {
      // default logo, when no one is provided
      if(label==="Logótipo"){
        temp[label] = logoURL;
        continue;
      }
      temp[label] = inputsInfo[label].value;
    }

    return temp;
  };

  const dataDoc = setupDataDoc(); // {"label" : "input value"}
  const installerNome = dataDoc["O seu nome"];
  const installerEmail = dataDoc["O seu email"];
  // name and email of who is installing to create that parent doc
  createInstallerParent(installerNome, installerEmail);
  console.log("dataDoc before install -> " + JSON.stringify(dataDoc));

  const docRef = firestore.doc("initialConfigs/parameters");

  docRef
    .set(dataDoc)
    .then(function () {
      // ------------- installation control doc
      const doc = {
        installation: true,
      };

      initDoc
        .set(doc)
        .then(function () {
          createDefaultUser();
          sendImportEmailToParent(installerNome, installerEmail).then();
          alert(sucessImportMessage);
          window.location.href = "/";
        })
        .catch(function (error) {
          alert("Erro: " + error);
        });
    })
    .catch(function (error) {
      alert("Erro: " + error);
    });

}
export { install, getGravatarURL };

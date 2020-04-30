import {
  firebaseConfig,
  firestore,
  initDoc,
} from "../firebase-config";
import firebase from "firebase";

import {getRandomInteger, getGravatarURL, languageCode} from "../utils/general_utils";
import {jsonParamsErrorMessage, importSucessMessage, provideRequiredFieldsMessage} from "../utils/messages_strings";
import {
  getAndSaveJSONparamsData,
  createDefaultUser,
  sendImportEmailToParent,
  uploadDefaultLogo,
  uploadNewLogo,
  uploadAssocDataFiles,
  removeAllInvalidFeedbacks,
  validZip,
  showZipWarning
} from "./installation";


const jsonErrorMessage = jsonParamsErrorMessage[languageCode];
const sucessImportMessage = importSucessMessage[languageCode];
const requiredFieldsMissingMessage = provideRequiredFieldsMessage[languageCode];




// -------------- person that installs --------------


function createInstallerParent(nome, email, cargo) {
  const docRef = firestore.collection("parents");
  let parentDoc = {};
  const numSocio = getRandomInteger(10000,100000).toString();
  parentDoc["Admin"] = true;
  parentDoc["Cargo"] = cargo;
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
  parentDoc["Quotas pagas"] = null; // TODO: check this (neither true or false)
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

// ------------------------------------------------------------

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

    // validate the zip code for the country
    const zipValue = document.getElementById("configAssocZip").value;
    if(!validZip(zipValue)){
      showZipWarning("configAssocZip");
      return;
    }

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
  const installerCargo = dataDoc["Cargo"];
  // name, email and role of who is installing to create that parent doc
  createInstallerParent(installerNome, installerEmail, installerCargo);
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

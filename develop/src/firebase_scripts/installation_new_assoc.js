import {
  firestore,
  initDoc,
} from "../firebase-config";
import firebase from "firebase";

import {
  defaultLogoFile,
  getGravatarURL,
  languageCode,
  parentsParameters, showToast, toastTypes
} from "../utils/general_utils";
import {
  jsonParamsErrorMessage,
  importSucessMessage,
  provideRequiredFieldsMessage,
  installError,
  rolesFileErrorMessage_NewAssoc,
  rolesFileErrorMessage,
  installDefaultLogoError
} from "../utils/messages_strings";
import {
  getAndSaveJSONparamsData,
  createDefaultUser,
  sendImportEmailToParent,
  uploadDefaultLogo,
  uploadNewLogo,
  uploadAssocDataFiles,
  removeAllInvalidFeedbacks,
  validZip,
  showZipWarning,
  installGotErrors,
  validEmail,
  showEmailWarning,
  setupTXTRoles, saveRolesInDB, saveDefaultLogoURL
} from "./installation";


const jsonErrorMessage = jsonParamsErrorMessage[languageCode];
const sucessImportMessage = importSucessMessage[languageCode];
const requiredFieldsMissingMessage = provideRequiredFieldsMessage[languageCode];
const rolesErrorMessage = rolesFileErrorMessage_NewAssoc[languageCode];




// -------------- person that installs --------------


function createInstallerParent(nome, email, cargo) {
  const docRef = firestore.collection("parents");
  let parentDoc = {};
  parentDoc[parentsParameters.ADMIN[languageCode]] = true;
  parentDoc[parentsParameters.ROLE[languageCode]] = cargo;
  parentDoc[parentsParameters.CC[languageCode]] = "";
  parentDoc[parentsParameters.FEES[languageCode]] = [];
  parentDoc[parentsParameters.ZIPCODE[languageCode]] = "";
  parentDoc[parentsParameters.REGISTER_DATE[languageCode]] = new Date().toJSON().split("T")[0]; // get date on format: 2015-03-25
  // adicionar array para educandos
  parentDoc[parentsParameters.CHILDREN[languageCode]] = [];
  parentDoc[parentsParameters.EMAIL[languageCode]] = email;
  parentDoc[parentsParameters.CITY[languageCode]] = "";
  parentDoc[parentsParameters.STREET[languageCode]] = "";
  parentDoc[parentsParameters.NIF[languageCode]] = "";
  parentDoc[parentsParameters.NAME[languageCode]] = nome;
  parentDoc[parentsParameters.ASSOC_NUMBER[languageCode]] = "1"; // first member
  parentDoc[parentsParameters.JOB[languageCode]] = "";
  parentDoc[parentsParameters.PAYED_FEE[languageCode]] = true; // TODO: check this
  parentDoc[parentsParameters.PHONE[languageCode]] = "";
  parentDoc["Validated"] = true; // imported parents are validated
  parentDoc["blocked"] = false; // imported parents are not blocked initially
  // avatar
  parentDoc[parentsParameters.PHOTO[languageCode]] = getGravatarURL(email);

  const parentRef = docRef.doc(email); // email as document id

  parentRef
    .set(parentDoc)
    .then(function () {
      //console.log("EE e educandos guardados com sucesso.");
    })
    .catch(function (error) {
      console.log("Erro: " + error);
      installGotErrors = false;
    });
}

// ------------------------------------------------------------

// PROCESS ROLES

/*
 * function to process TEXT with roles for the association's members:
 *  read the file, get a list of roles from it and check if the
 *  role written in the form is a role from this TXT file
 * */
function readAndCheckRolesFile(rolesFile, callback) {
  const rolesReader = new FileReader();
  let rolesFileString = "NR";

  rolesReader.onloadend = function () {
    rolesFileString = rolesReader.result;
    let rolesFileCorrect = false; // control the correctness of roles file
    try{
      // if there's no information in the file, it's invalid
      if(rolesFileString.trim().length===0){
        throw "Too few data in TEXT file to process";
      }

      const rolesList = setupTXTRoles(rolesFileString);
      const cargoValue = document.getElementById("configAssocAdminCargo").value;

      if(parentsRolesAreValid(rolesList, cargoValue)){
        rolesFileCorrect = true;
        saveRolesInDB(rolesList);
        callback(rolesFileCorrect);
      }
      else{
        rolesFileCorrect = false;
        callback(rolesFileCorrect);
      }
    }
    catch (e) {
      // catch error if the TXT is improperly formatted, for example
      rolesFileCorrect = false;
      callback(rolesFileCorrect);
    }
  };
  rolesReader.readAsText(rolesFile, "UTF-8");
}

function parentsRolesAreValid(rolesArray, roleInInput){
  let parentsRolesValid = true;
  console.log("roleInInput -> " + roleInInput);
  if(!rolesArray.includes(roleInInput.trim())){
    console.log("txt não inclui <" + roleInInput.trim() + ">");
    parentsRolesValid = false;
  }

  return parentsRolesValid;
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
          if(labelText.trim()==="Valor da Quota (€)"){
            labelText = "Quota";
          }
          else{
            labelText = labelText.split(" ")[0];
          }
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

    const emailValue = document.getElementById("configAssocEmail").value;
    if(!validEmail(emailValue)){
      showEmailWarning("configAssocEmail");
      return;
    }

    const adminEmailValue = document.getElementById("configAdminEmail").value;
    if(!validEmail(adminEmailValue)){
      showEmailWarning("configAdminEmail");
      return;
    }

    // read files and save their data
    const paramsJSONfile = document.getElementById("configAssocNewParams").files[0];
    const rolesFile = document.getElementById("configAssocCargos").files[0];

    getAndSaveJSONparamsData(paramsJSONfile, function (jsonCorrect) {
      if(!jsonCorrect){
        // if there's an error with JSON, not allow to submit the form
        const paramsInput = document.getElementById("configAssocNewParams");
        paramsInput.classList.add("is-invalid");
        document.querySelector("#" + paramsInput.id + "Feedback").style.display =
          "block";
        paramsInput.value = "";
        showToast(jsonErrorMessage, 15000, toastTypes.ERROR);
      }
      else{

        readAndCheckRolesFile(rolesFile, function (rolesCorrect) {
          if(!rolesCorrect){
            // reset all import files' inputs that potentially lead to error
            const rolesFileInput = document.getElementById("configAssocCargos");
            rolesFileInput.classList.add("is-invalid");
            document.querySelector("#" + rolesFileInput.id + "Feedback").style.display =
              "block";
            //paramsInput.value = "";

            const roleInput = document.getElementById("configAssocAdminCargo");
            roleInput.classList.add("is-invalid");
            document.querySelector("#" + roleInput.id + "Feedback").style.display =
              "block";
            showToast(rolesErrorMessage, 15000, toastTypes.ERROR);

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
                  installGotErrors = true;
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
              // try to upload the file to firestore by its name
              const defaultLogoTask = uploadDefaultLogo();
              defaultLogoTask
                .then(function (downloadURL) {
                  saveDefaultLogoURL(downloadURL);
                  continueInstallation(inputsInfo, downloadURL);
              }).catch(() => {
                // alternatively, use asset file directly
                if(defaultLogoFile!=null){
                  continueInstallation(inputsInfo, defaultLogoFile);
                }
                else{
                  showToast(installDefaultLogoError[languageCode], 20000, toastTypes.ERROR);
                }
              });
            }
          }
        });
      }

    });

  } else showToast(requiredFieldsMissingMessage, 5000, toastTypes.ERROR);
}

function continueInstallation(inputsInfo, logoURL) {
  if(installGotErrors){
    showToast(installError[languageCode], 5000, toastTypes.ERROR);
    installGotErrors = false;
    return;
  }

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

    temp["DeleteRegistosSemPagar"] = "7";

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
          showToast(sucessImportMessage, 5000, toastTypes.SUCCESS);
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

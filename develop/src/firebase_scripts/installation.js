import {
  firestore,
  storageRef,
  initDoc,
  firebaseConfig,
} from "../firebase-config";
import firebase from "firebase";

import {getGravatarURL, defaultLogoFile, newParametersTypes, languageCode, newParametersEntities,
  membersImportFileNewParametersStartIndex, studentsImportFileNewParametersStartIndex, membersCSVparamsIndexes, studentsCSVparamsIndexes,
  studentsParameters, parentsParameters
} from "../utils/general_utils";
import {jsonParamsErrorMessage, jsonOrCsvParamsErrorMessage, importSucessMessage, provideRequiredFieldsMessage} from "../utils/messages_strings";
const jsonErrorMessage = jsonParamsErrorMessage[languageCode];
const csvsErrorMessage = jsonOrCsvParamsErrorMessage[languageCode];
const sucessImportMessage = importSucessMessage[languageCode];
const requiredFieldsMissingMessage = provideRequiredFieldsMessage[languageCode];

const parentDesignation = newParametersEntities.parent[languageCode];
const studentDesignation = newParametersEntities.student[languageCode];

let membersEmails = {};

let newParametersData = {
  parent :
    {
      provided : false,
      params : null
    },

  student :
    {
      provided : false,
      params : null
    }

};

// save parameters (which are the headers) from imported csv
let membersFileHeaders = [];
let studentsFileHeaders = [];


// ------------------------------------------------------------
// NEW PARAMETERS


/* function to check if the entities (parent and student) have the right designation
* and if their parameters are supported (have also the right designation)
* */
function checkJSONparamsEntitiesAndTypes(json) {

  // check entities
  const entities = Object.keys(json).length;
  //console.log("entities (" + entities + ") -> " + Object.keys(json));
  const parentParams = json[parentDesignation];
  const studentParams = json[studentDesignation];


  if(entities === 1 && parentParams==null && studentParams==null){
    /*
    * with one entity, just one of them must be null;
    * if none of them is parent or student: invalid JSON
    * */
    return false;
  }
  if(entities===2 && ((parentParams==null) || (studentParams==null))){
    // if there are 2, but at least one of them is null: invalid JSON
    return false;
  }

  //parentParams ? console.log("parentParams -> " + JSON.stringify(parentParams)) : console.log("parentParams -> " + parentParams);
  //studentParams ? console.log("studentParams -> " + JSON.stringify(studentParams)) : console.log("studentParams -> " + studentParams);

  if(entities === 0){ // allow no parameters, as the input field is required
    return true;
  }
  else if(entities >=3){
    // only 2 entities, at max (parent and student)
    return false;
  }
  else if(1<=entities<=2) {
    // check parameters themselves
    let parentKeys;
    let studentKeys;

    if(parentParams)
      parentKeys = Object.keys(parentParams);
    if(studentParams)
      studentKeys = Object.keys(studentParams);

    //console.log("parentKeys: " + parentKeys);
    //console.log("studentKeys: " + studentKeys);

    /* if they exist, but have no parameters: JSON no accepted
    *   - if the user does not want parameters for either
    *     parent or student, simply does not write them in the JSON
    * */
    if(parentParams){
      if(parentKeys.length === 0)
        return false;
    }
    if(studentParams){
      if(studentKeys.length === 0)
        return false;
    }
    const TEXT = newParametersTypes.TEXT[languageCode];
    const INT = newParametersTypes.INT[languageCode];
    const FLOAT = newParametersTypes.FLOAT[languageCode];
    //  check parent's parameters
    if(parentParams){
      if(parentKeys.length>0){
        for (let i = 0; i< parentKeys.length; i++){
          const chave = parentKeys[i];
          //console.log(chave + " : " + parentParams[chave]);
          // if none of supported parameters: invalid JSON
          if(parentParams[chave]!==TEXT && parentParams[chave]!==INT && parentParams[chave]!==FLOAT){
            return false;
          }
        }
      }
    }
    //  check student's parameters
    if(studentParams){
      if(studentKeys.length>0){
        for (let i = 0; i< studentKeys.length; i++){
          const chave = studentKeys[i];
          //console.log(chave + " : " + studentParams[chave]);
          // if none of supported parameters: invalid JSON
          if(studentParams[chave]!==TEXT && studentParams[chave]!==INT && studentParams[chave]!==FLOAT){
            return false;
          }
        }
      }
    }
  }


  // save globally to check later against the CSV parameters
  if(parentParams!=null){
    newParametersData.parent.provided = true;
    newParametersData.parent.params = parentParams;
  }
  if(studentParams!=null){
    newParametersData.student.provided = true;
    newParametersData.student.params = studentParams;
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

function saveRegistToDB(json) {
  const docRef = firestore.collection("parents");
  const parentRef = docRef.doc(json["Email"]);
  parentRef
    .set(json)
    .then(function () {
      alert("Sucesso no envio da inscrição!");
    })
    .catch(function (error) {
      alert("Erro no envio da inscrição, por favor, tente novamente!");
    });
}

function saveCaseToDB(json) {
  //console.log("Json to save to DB -> ", JSON.stringify(json));

  const docRef = firestore.collection("casos");
  const ref = docRef.doc();

  ref
    .set(json)
    .then(function () {
      alert("Sucesso!");
    })
    .catch(function (error) {
      alert("Erro no envio do caso, por favor, tente novamente!");
    });
}

// ------------------------------------------------------------
// PROCESS CSV

/*
* function to check if the parameters provided in JSON are also
* present in the concerning CSV file (parents and/or students) and vice-versa;
* this receives and array of previously validated parameters from the JSON file
* and also an array with the new parameters of CSV
* */
function compareCSVandJsonParameters(jsonParams, csvParams){

  // check if both arrays have the same amount of parameters
  if(jsonParams.length!==csvParams.length)
    return false;

  // if no parameters, then is valid
  if(jsonParams.length===0 && csvParams.length===0)
    return true;


  // check if all parameters from JSON are also in the CSV
  for(let i=0; i<jsonParams.length; i++){
    if(!(csvParams.includes(jsonParams[i]))){
      return false;
    }
  }

  // check if all parameters from JSON are also in the CSV
  for(let i=0; i<csvParams.length; i++){
    if(!(jsonParams.includes(csvParams[i]))){
      return false;
    }
  }

  return true;
}


/*
* function for, given a list of parameters from CSV, checks if
* they are all expected/suported by our platform;
* the parent argument (boolean) specifies if we are evaluating
* the parent parameters or not (the students)
* */
function areAllParametersSupported(paramsArray, parent) {

    let supportedParams = [];
    if(parent){
      for(let x in parentsParameters){
        supportedParams.push(parentsParameters[x][languageCode]);
      }
    }
    else{
      for(let x in studentsParameters){
        supportedParams.push(studentsParameters[x][languageCode]);
      }
    }

    console.log("paramsArray -> " + paramsArray);
    console.log("supportedParams -> " + supportedParams);

    for(let i=0; i<paramsArray.length; i++){
      if(!supportedParams.includes(paramsArray[i].trim())){
        return false;
      }
    }

    return true;
}


/*
 * function to process CSV with members and students' data:
 *  extract the headers an analyse each line
 *    - result for each line: { "header1" : data1, "header2" : data2, ...}
 * */
function getandSaveCSVdata(parentsFile, childrenFile, callback) {
  const parentReader = new FileReader();
  const childrenReader = new FileReader();
  let parentFileString = "NR";
  let childrenFileString = "NR";

  let filesParamsCorrect = false; // control the parameters validation between JSON and CSV

  parentReader.onloadend = function () {
    parentFileString = parentReader.result;
    try{
      const parentList = setupCSVData(parentFileString, true);

      childrenReader.onloadend = function () {
        childrenFileString = childrenReader.result;
        const childrenList = setupCSVData(childrenFileString, false);

        // check if expected parameters are with the supported name for language
        // get only the parameters from CSV that we are expecting and check if we support them
        const parentsExpectedHeaders = membersFileHeaders.slice(0, membersImportFileNewParametersStartIndex);
        const studentsExpectedHeaders = studentsFileHeaders.slice(0,studentsImportFileNewParametersStartIndex);

        if(!areAllParametersSupported(parentsExpectedHeaders, true) || !areAllParametersSupported(studentsExpectedHeaders, false)){
          filesParamsCorrect = false;
          callback(filesParamsCorrect);
          return;
        }


        let parentParams = [];
        let studentParams = [];
        if(newParametersData.parent.provided)
          parentParams = Object.keys(newParametersData.parent.params);
        if(newParametersData.student.provided)
          studentParams = Object.keys(newParametersData.student.params);

        console.log("parentParams: " + parentParams);
        console.log("studentParams: " + studentParams);

        // get only the headers with the new parameters
        const parentsNewHeaders = membersFileHeaders.slice(membersImportFileNewParametersStartIndex);
        const studentsNewHeaders = studentsFileHeaders.slice(studentsImportFileNewParametersStartIndex);

        console.log("parentsNewHeaders: " + parentsNewHeaders);
        console.log("studentsNewHeaders: " + studentsNewHeaders);

        if(compareCSVandJsonParameters(parentParams, parentsNewHeaders)
          && compareCSVandJsonParameters(studentParams, studentsNewHeaders)){
          filesParamsCorrect = true;
          saveParentsAndChildrenFromFileDatatoDB(parentList, childrenList);
          callback(filesParamsCorrect);
        }
        else{
          filesParamsCorrect = false;
          callback(filesParamsCorrect);
        }


      };
    }
    catch (e) {
      // catch error if the CSV is improperly formatted, for example
      filesParamsCorrect = false;
      callback(filesParamsCorrect);
    }
  };

  parentReader.readAsText(parentsFile, "UTF-8");
  childrenReader.readAsText(childrenFile, "UTF-8");
}

/*
 * analyse processed CSV data and saves it in Firestore
 *   -  for each parent, will check the students with the corresponding
 *      associate number and add that students documents in the array
 *      of children of that parent document
 *   -  finally, the parent document (with its children) will be saved
 *      in Firestore
 * */
/*
* TODO:
*   - replace "ND" from CSV for empty strings
* */
function saveParentsAndChildrenFromFileDatatoDB(parentsList, childrenList) {
  // parents and children list ordered by associate number
  const parentDocList = parentsList.sort((a, b) =>
    parseInt(a[Object.keys(a)[membersCSVparamsIndexes.assoc_num_index]]) > parseInt(b[Object.keys(b)[membersCSVparamsIndexes.assoc_num_index]]) ? 1 : -1
  );

  const childrenDocList = childrenList.sort((a, b) =>
    parseInt(a[Object.keys(a)[studentsCSVparamsIndexes.parent_assoc_num_index]]) > parseInt(b[Object.keys(b)[studentsCSVparamsIndexes.parent_assoc_num_index]]) ? 1 : -1
  );

  //console.log("parentDocList -> ", parentDocList);
  //console.log("childrenDocList -> ", childrenDocList);

  const docRef = firestore.collection("parents");

  // add each to parent the students with the same parent's associate number
  for (let i = 0; i < parentDocList.length; i++) {
    let parentDoc = parentDocList[i];
    const numSocio = parentDoc[Object.keys(parentDoc)[membersCSVparamsIndexes.assoc_num_index]];

    const nome = parentDoc[Object.keys(parentDoc)[membersCSVparamsIndexes.name_index]].split(" ")[0]; // first name
    const email = parentDoc[Object.keys(parentDoc)[membersCSVparamsIndexes.email_index]];
    membersEmails[nome] = email; // get name and email to send email afterwards

    let parentChildren = []; // childrens of the current parent

    // search for children with the same parent's associate number as above
    for (let j = 0; j < childrenDocList.length; j++) {
      const child = childrenDocList[j];
      if (numSocio !== child[Object.keys(child)[studentsCSVparamsIndexes.parent_assoc_num_index]])
        // if associate number is not equal, then this is not child of the current parent
        continue;

      let childDoc = child;

      // remove associate number and parent's name from child's document, as
      // it will be inside its parent documento
      delete childDoc[Object.keys(childDoc)[0]];// TODO: check this index
      delete childDoc[Object.keys(childDoc)[0]]; // remove 0 because the element at 1 shifted to 0 in the line above

      parentChildren.push(childDoc);
    }

    // add children document array to parent's documento
    parentDoc["Educandos"] = parentChildren;

    // convert admin boolean from CSV from string to boolean
    parentDoc["Admin"] = parentDoc["Admin"] === "true";
    // convert dues payment boolean from CSV from string to boolean
    parentDoc["Quotas pagas"] = parentDoc["Quotas pagas"] === "true";

    // add remaining necessary parameters
    parentDoc["Cotas"] = [];
    parentDoc["Data inscricao"] = new Date().toJSON().split("T")[0]; // get date on format: 2015-03-25
    // only regulars with payed dues are validated
    parentDoc["Validated"] = !(!parentDoc["Admin"] && !parentDoc["Quotas pagas"]);
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
}

/*
* function to read and format data from CSV in an array of dictionaries;
* receives the file as a string and a boolean to indicate it's reading
* the parents' CSV or the students' */
function setupCSVData(fileString, parents) {
  const allLines = fileString.split(/\r\n|\n/).filter((item) => item); // remove empty strings
  //console.log("allLines -> ", allLines);

  // remove empty strings and trailing spaces
  const headers = allLines[0].split(/[,;]+/).filter((item) => item).map(s => s.trim());

  // save this headers (which represent parameters) globally
  if(parents)
    membersFileHeaders = headers;
  else studentsFileHeaders = headers;
  // ---------------------------------------------------------------

  let rowsData = [];

  //console.log("headers -> ", headers);

  for (let i = 1; i < allLines.length; i++) {
    let lineDict = {};

    // remove empty strings and trailing spaces
    let dadosLinha = allLines[i].split(/[,;]+/).filter((item) => item).map(s => s.trim());

    //console.log("dadosLinha atual -> ", dadosLinha);
    //console.log("dadosLinha length -> ", dadosLinha.length);
    //console.log("headers length -> ", headers.length);

    // if there's more data than corresponding headers; CSV not valid
    if(dadosLinha.length !== headers.length){
      // eslint-disable-next-line no-throw-literal
      throw 'CSV headers and data in a line do not match';
    }

    //console.assert(dadosLinha.length === headers.length);

    for (let j = 0; j < dadosLinha.length; j++) {
      lineDict[headers[j]] = dadosLinha[j];
    }

    rowsData.push(lineDict);
  }

  return rowsData;
}

// --------- USER
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

  window.localStorage.setItem("emailForSignIn", tempEmail);

  const request = async () => {
    await fetch(uri)
      .then()
      .catch(function (error) {
        console.log("Error sending import email: " + error);
      });
  };

  return request();
}


function notifyAllParents() {
  for (let name in membersEmails) {
    const email = membersEmails[name];
    console.log(name + " : " + email);
    sendImportEmailToParent(name, email).then();
  }
}

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

/*
* receives the HTML input id and upload the file it holds
* */
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
    if (inputs[i].classList.contains("is-invalid")) {
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

  //------------------------

  /*const setupDataDocTest = () => {
    let temp = {};
    for (const label in inputsInfo) {
      temp[label] = inputsInfo[label].value;
    }

    return temp;
  };

  const dataDocTest = setupDataDocTest();
  console.log("dataDocTest -> ", dataDocTest);*/

  //-------------------------

  if (requiredFieldsProvided && policyCheckboxChecked) {
    // read files and save their data
    const paramsJSONfile = document.getElementById("configAssocNewParams")
      .files[0];
    const membersFile = document.getElementById("configAssocMembers").files[0];
    const studentsFile = document.getElementById("configAssocStudents")
      .files[0];

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
        getandSaveCSVdata(membersFile, studentsFile, function (paramsFilesCorrect) {

          if(!paramsFilesCorrect){
            // reset all import files' inputs
            const paramsInput = document.getElementById("configAssocNewParams");
            paramsInput.classList.add("is-invalid");
            document.querySelector("#" + paramsInput.id + "Feedback").style.display =
              "block";
            paramsInput.value = "";

            // if there's an error with CSVs, not allow to submit the form
            const membersInput = document.getElementById("configAssocMembers");
            membersInput.classList.add("is-invalid");
            document.querySelector("#" + membersInput.id + "Feedback").style.display =
              "block";
            membersInput.value = "";


            const studentsInput = document.getElementById("configAssocStudents");
            studentsInput.classList.add("is-invalid");
            document.querySelector("#" + studentsInput.id + "Feedback").style.display =
              "block";
            studentsInput.value = "";
            alert(csvsErrorMessage);
          }

          else{
            // uploads after files are validated
            uploadAssocDataFiles("configAssocMembers");
            uploadAssocDataFiles("configAssocStudents");
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
                  console.log("Logo upload " + progress + "% completed");
                  switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                      console.log("Logo upload on pause");
                      break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                      console.log("Logo upload in progress");
                      break;
                  }
                },
                function (error) {
                  console.log("Logo upload failed: " + error);
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


      }

    });

  } else {
      alert(requiredFieldsMissingMessage);
  }
}

function continueInstallation(inputsInfo, logoURL) {
  const setupDataDoc = () => {
    let temp = {};
    for (const label in inputsInfo) {
      // default logo, when no one is provided
      if (label === "Logótipo") {
        temp[label] = logoURL;
        continue;
      }
      temp[label] = inputsInfo[label].value;
    }

    return temp;
  };

  const dataDoc = setupDataDoc(); // {"label" : "input value"}
  // send email to all imported parents
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
          notifyAllParents();
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

export { install, saveRegistToDB, saveCaseToDB, getGravatarURL,
        // functions reused in installation of a brand new association
        getAndSaveJSONparamsData,
        createDefaultUser,
        sendImportEmailToParent,
        uploadDefaultLogo,
        uploadNewLogo,
        uploadAssocDataFiles,
        removeAllInvalidFeedbacks,
        // functions used in tests
        checkJSONparamsEntitiesAndTypes,
        compareCSVandJsonParameters,
        getandSaveCSVdata};

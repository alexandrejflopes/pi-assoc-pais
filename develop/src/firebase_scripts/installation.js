import {
  firestore,
  storageRef,
  initDoc,
  firebaseConfig,
} from "../firebase-config";
import firebase from "firebase";

import {
  getGravatarURL,
  defaultLogoFile,
  newParametersTypes,
  languageCode,
  newParametersEntities,
  membersImportFileNewParametersStartIndex,
  studentsImportFileNewParametersStartIndex,
  membersCSVparamsIndexes,
  studentsCSVparamsIndexes,
  studentsParameters,
  parentsParameters,
  notAvailableDesignation,
  zipCodeRegexes,
  defaultAvatar, showToast, toastTypes, emailRegex, cargoDocKey
} from "../utils/general_utils";
import {
  jsonParamsErrorMessage,
  jsonOrCsvParamsErrorMessage,
  importSucessMessage,
  provideRequiredFieldsMessage,
  invalidZipMessage,
  registationSuccess,
  registationError,
  addCaseSucess,
  addCaseError,
  uploadLogoError,
  installError,
  invalidEmailMessage,
  rolesFileErrorMessage, installDefaultLogoError
} from "../utils/messages_strings";
const jsonErrorMessage = jsonParamsErrorMessage[languageCode];
const csvsErrorMessage = jsonOrCsvParamsErrorMessage[languageCode];
const sucessImportMessage = importSucessMessage[languageCode];
const requiredFieldsMissingMessage = provideRequiredFieldsMessage[languageCode];
const rolesErrorMessage = rolesFileErrorMessage[languageCode];

const parentDesignation = newParametersEntities.parent[languageCode];
const studentDesignation = newParametersEntities.student[languageCode];
const NAdesignation = notAvailableDesignation[languageCode];

export let installGotErrors = false;


let membersEmails = {};
let membersDocsList = []; // save members docs to check their roles later

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

/*
* function to fetch existing associate numbers
* */
function fetchAssocNumbers() {

  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/getParentsNumeroSocio";

  //console.log("profile uri: " + uri);

  const request = async () => {
    let assocNumbers;
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        console.log("assoc numbers recebidos -> ", JSON.stringify(data));
        assocNumbers = data;
      })
      .catch(function (error) {
        console.log(error);
      });

    return assocNumbers;
  };

  return request();

}

/*
* function to get a new associate number (the associate numbers are incremental)
* */
function generateNewAssocNumber(numbersArray) {
  // TODO: use Firebase Increment?
  // remove empty strings, nulls and undefined and convert number strings to actual numbers
  const numbers = numbersArray.filter(el=>el).map(x=>+x);
  return Math.max(...numbers) + 1;
}


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
      installGotErrors = true;
    });
}

function saveRegistToDB(json) {
  const docRef = firestore.collection("parents");
  const parentRef = docRef.doc(json["Email"]);
  parentRef
    .set(json)
    .then(function () {
      showToast(registationSuccess[languageCode], 5000, toastTypes.SUCCESS);
    })
    .catch(function (error) {
      console.log("regist save error: " + JSON.stringify(error));
      showToast(registationError[languageCode], 5000, toastTypes.ERROR);
    });
}

function saveCaseToDB(json) {
  //console.log("Json to save to DB -> ", JSON.stringify(json));

  const docRef = firestore.collection("casos");
  const ref = docRef.doc();

  ref
    .set(json)
    .then(function () {
      showToast(addCaseSucess[languageCode], 5000, toastTypes.SUCCESS);
    })
    .catch(function (error) {
      showToast(addCaseError[languageCode], 5000, toastTypes.ERROR);
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

    //console.log("paramsArray -> " + paramsArray);
    //console.log("supportedParams -> " + supportedParams);

    for(let i=0; i<paramsArray.length; i++){
      if(!supportedParams.includes(paramsArray[i].trim())){
        return false;
      }
    }

    return true;
}


/*
* function for, given a list of parameters from CSV, checks if
* they are all really new and are not equal (in their name)
* to the parameters that our plataform already supports
* */
function allNewParametersAreReallyNew(supportedParams, newParams) {

  if(newParams.length===0){
    return true; // if no new parameters, so this must pass
  }

  for(let i=0; i<newParams.length; i++){
    for(let x = 0; x<supportedParams.length; x++){
      // compare the names in the same conditions
      const newParamName = newParams[i].trim().toLowerCase();
      const supportedParamName = supportedParams[x].trim().toLowerCase();

      if(newParamName===supportedParamName)
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

      // if there's no information in the file, it's invalid
      if(parentFileString.trim().length===0){
        throw "Too few data in CSV file to process";
      }

      const parentList = setupCSVData(parentFileString, true);

      childrenReader.onloadend = function () {
        childrenFileString = childrenReader.result;

        try{

          // if there's no information in the file, it's invalid
          if(childrenFileString.trim().length===0){
            throw "Too few data in CSV file to process";
          }

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

          //console.log("parentParams: " + parentParams);
          //console.log("studentParams: " + studentParams);

          // get only the headers with the new parameters
          const parentsNewHeaders = membersFileHeaders.slice(membersImportFileNewParametersStartIndex);
          const studentsNewHeaders = studentsFileHeaders.slice(studentsImportFileNewParametersStartIndex);


          if( !allNewParametersAreReallyNew(parentsExpectedHeaders, parentsNewHeaders) ||
              !allNewParametersAreReallyNew(studentsExpectedHeaders, studentsNewHeaders))
          {
            filesParamsCorrect = false;
            callback(filesParamsCorrect);
            return;
          }

          //console.log("parentsNewHeaders: " + parentsNewHeaders);
          //console.log("studentsNewHeaders: " + studentsNewHeaders);

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
        }
        catch (e) {
          // catch error if the CSV is improperly formatted, for example
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

      childDoc[studentsParameters.PHOTO[languageCode]] = defaultAvatar;

      parentChildren.push(childDoc);
    }

    // add children document array to parent's documento
    parentDoc["Educandos"] = parentChildren;

    // convert admin boolean from CSV from string to boolean
    parentDoc["Admin"] = parentDoc["Admin"] === "true";
    // convert dues payment boolean from CSV from string to boolean (if not available, it gets false as well)
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
        installGotErrors = true;
      });
  }
}

/*
* function to read and format data from CSV in an array of dictionaries;
* receives the file as a string and a boolean to indicate it's reading
* the parents' CSV or the students'
* */
function setupCSVData(fileString, parents) {
  const allLines = fileString.split(/\r\n|\n/).filter((item) => item); // remove empty strings
  //console.log("allLines -> ", allLines);

  // if there's no information in the file, it's invalid
  if(allLines.length<=1){
    console.log("sem dados nas linhas");
    throw "Too few data in CSV file to process"
  }

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

    dadosLinha = dadosLinha.map(function (item) { return item.toUpperCase() === NAdesignation ? NAdesignation : item });
    // convert boolean strings to lower case
    dadosLinha = dadosLinha.map(function (item) { return item.toLowerCase() === "true" ? "true" : item });
    dadosLinha = dadosLinha.map(function (item) { return item.toLowerCase() === "false" ? "false" : item });

    // check if boolean params in members csv are really booleans
    if(parents){
      if(dadosLinha[membersCSVparamsIndexes.quotas_index]!=="true" && dadosLinha[membersCSVparamsIndexes.quotas_index]!=="false"){
        //console.log("Expected 'true' or 'false' in quotas column!");
        throw "Expected 'true' or 'false' in quotas column!";
      }

      if(dadosLinha[membersCSVparamsIndexes.admin_index]!=="true" && dadosLinha[membersCSVparamsIndexes.admin_index]!=="false"){
        //console.log("Expected 'true' or 'false' in admin column!");
        throw "Expected 'true' or 'false' in admin column!";
      }

    }


    //console.assert(dadosLinha.length === headers.length);

    for (let j = 0; j < dadosLinha.length; j++) {
      lineDict[headers[j]] = dadosLinha[j];
    }

    rowsData.push(lineDict);
  }

  // save parents globally to save their roles
  if(parents)
    membersDocsList = rowsData;

  return rowsData;
}

// ------------------------------------------------------------
// PROCESS ROLES

/*
 * function to process TEXT with roles for the association's members:
 *  read the file, get a list of roles from it and check if the
 *  roles of the members from the CSV have a role from this TXT file
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

      if(parentsRolesAreValid(rolesList, membersDocsList)){
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

/*
 * function to read the TEXT file with roles for the association's
 * members and get a list of roles from it
 * */
export function setupTXTRoles(fileString){
  const allLines = fileString.split(/\r\n|\n/).filter((item) => item); // remove empty strings
  console.log("allLinesTXT -> ", allLines);

  // if there's no information in the file, it's invalid
  if(allLines.length===0){
    console.log("sem dados nas linhas do txt");
    throw "Too few data in TXT file to process"
  }

  let cargos = [];
  for(let i = 0; i < allLines.length; i++){
    let cargosNaLinha = allLines[i].split(/[,]+/).filter((item) => item).map(s => s.trim()); // remove empty strings and trailing spaces
    cargos = cargos.concat(cargosNaLinha); // add this roles to the main array
  }
  console.log("cargos lidos -> " + cargos);
  return cargos;
}

/*
 * for each role imported, save it as a document in Firestore
 * - for each role: {"titulo" (from cargoDocKey constant) : <role_name>}
 * */
export function saveRolesInDB(rolesArray){
  const cargosRef = firestore.collection("cargos");
  for(let pos in rolesArray){
    const cargo = rolesArray[pos];

    const cargoDoc = {[cargoDocKey] : cargo};
    const docRef = cargosRef.doc(cargo);
    docRef
      .set(cargoDoc)
      .then(function () {
        console.log("Cargo <" + cargo + "> guardado com sucesso.");
      })
      .catch(function (error) {
        console.log("erro ao guardar cargo <" + cargo + ">");
        installGotErrors = true;
      });
  }
}

/*
 * function to check if the roles of the members from the CSV
 * have a role from the TXT file provided with the association's roles
 * */
function parentsRolesAreValid(rolesArray, parentsDocList){
  let parentsRolesValid = true;
  console.log("parentsDocList");
  console.log("----------------");
  console.log(parentsDocList);
  for(let pos in parentsDocList){
    const parentDoc = parentsDocList[pos];
    console.log("parentDoc atual >" + JSON.stringify(parentDoc));
    const parentRole = parentDoc[parentsParameters.ROLE[languageCode]];
    if(!rolesArray.includes(parentRole)){
      console.log("txt não inclui <" + parentRole + ">");
      parentsRolesValid = false;
      break;
    }
  }

  return parentsRolesValid;
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
    //console.log(name + " : " + email);
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

export function saveDefaultLogoURL(url) {
  const defaultLogoRef = firestore.collection("initialConfigs");
  const logoDoc = {"url" : url};
  const docRef = defaultLogoRef.doc("defaultLogo");
  docRef
    .set(logoDoc)
    .then(function () {
      console.log("defaultLogo guardado com sucesso.");
    })
    .catch(function () {
      console.log("erro ao guardar defaultLogo na BD");
      installGotErrors = true;
    });

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
      installGotErrors = true;
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


function validZip(zipCodeValue) {
    const zipRegex = zipCodeRegexes[languageCode].regex;
    const zipLength = zipCodeRegexes[languageCode].length;
    if(zipCodeValue.trim().length!==zipLength)
      return false;
    const processedZip = zipCodeValue.trim().slice(0,zipLength);
    return zipRegex.test(processedZip);
}

function showZipWarning(elementId) {
  // if there's an error with zip code, not allow to submit the form and show warning
  const zipInput = document.getElementById(elementId);
  zipInput.classList.add("is-invalid");
  document.querySelector("#" + zipInput.id + "Feedback").style.display =
    "block";
  //zipInput.value = "";
  showToast(invalidZipMessage[languageCode], 5000, toastTypes.ERROR);
}

function validEmail(emailValue) {
  const emailReg = emailRegex;
  const processedEmail = emailValue.trim();
  return emailReg.test(processedEmail);
}

function showEmailWarning(elementId) {
  // if there's an error with zip code, not allow to submit the form and show warning
  const emailInput = document.getElementById(elementId);
  emailInput.classList.add("is-invalid");
  document.querySelector("#" + emailInput.id + "Feedback").style.display =
    "block";
  showToast(invalidEmailMessage[languageCode], 5000, toastTypes.ERROR);
}


function install() {
  removeAllInvalidFeedbacks();
  let requiredFieldsProvided = true;
  let policyCheckboxChecked = true;
  const inputsInfo = getFormElementsAndValues(); // { "labelText" : input }

  //console.log("inputsInfo v ");
  //console.log(inputsInfo);

  for (const label in inputsInfo) {
    //console.log("label -> " + label);
    let input = inputsInfo[label];
    //console.log("input v ");
    //console.log(input);
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

    // read files and save their data
    const paramsJSONfile = document.getElementById("configAssocNewParams")
      .files[0];
    const membersFile = document.getElementById("configAssocMembers").files[0];
    const studentsFile = document.getElementById("configAssocStudents").files[0];
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
        getandSaveCSVdata(membersFile, studentsFile, function (paramsFilesCorrect) {

          if(!paramsFilesCorrect){
            // reset all import files' inputs that potentially lead to error
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
            showToast(csvsErrorMessage, 15000, toastTypes.ERROR);
          }

          else{

            readAndCheckRolesFile(rolesFile, function (rolesCorrect) {

              if(!rolesCorrect){
                // reset all import files' inputs that potentially lead to error

                // if there's an error with CSVs, not allow to submit the form
                const membersInput = document.getElementById("configAssocMembers");
                membersInput.classList.add("is-invalid");
                document.querySelector("#" + membersInput.id + "Feedback").style.display =
                  "block";
                membersInput.value = "";


                const rolesInput = document.getElementById("configAssocCargos");
                rolesInput.classList.add("is-invalid");
                document.querySelector("#" + rolesInput.id + "Feedback").style.display =
                  "block";
                rolesInput.value = "";

                showToast(rolesErrorMessage, 15000, toastTypes.ERROR);
              }
              else{
                // uploads after files are validated
                uploadAssocDataFiles("configAssocMembers");
                uploadAssocDataFiles("configAssocStudents");
                uploadAssocDataFiles("configAssocNewParams");
                //uploadAssocDataFiles("configAssocNewParams");

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
                      installGotErrors = true;
                      showToast(uploadLogoError[languageCode], 5000, toastTypes.ERROR);
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
                  })
                    .catch(() => {
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

            })
          }

        });


      }

    });

  } else {
      showToast(requiredFieldsMissingMessage, 5000, toastTypes.ERROR);
  }
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
      if (label === "Logótipo") {
        temp[label] = logoURL;
        continue;
      }
      temp[label] = inputsInfo[label].value;
    }

    temp["DeleteRegistosSemPagar"] = "7";

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

export { install, saveRegistToDB, saveCaseToDB, getGravatarURL,
        // functions reused in installation of a brand new association
        getAndSaveJSONparamsData,
        createDefaultUser,
        sendImportEmailToParent,
        uploadDefaultLogo,
        uploadNewLogo,
        uploadAssocDataFiles,
        removeAllInvalidFeedbacks,
        validZip,
        showZipWarning,
        validEmail,
        showEmailWarning,
        generateNewAssocNumber,
        fetchAssocNumbers,
        // functions used in tests
        checkJSONparamsEntitiesAndTypes,
        compareCSVandJsonParameters,
        getandSaveCSVdata};

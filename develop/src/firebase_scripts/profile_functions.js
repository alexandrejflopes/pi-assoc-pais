import {
  firebase_auth,
  firebaseConfig,
  firestore,
  storageRef
} from "../firebase-config";
import {
  languageCode,
  newParametersEntities, newParametersInputTypes,
  newParametersTypes
} from "../utils/general_utils";


async function fetchUserDoc(email) {

  console.log("profile email to fetch: " + email);

  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/getParent?" +
    "id=" +
    encodeURIComponent(email);

  //console.log("profile uri: " + uri);

  const request = async () => {
    let userDoc = {};
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        console.log("user recebido -> ", JSON.stringify(data));
        userDoc = data;
      })
      .catch(function (error) {
        console.log(error);
      });

    return userDoc;
  };

  return request();
}

function userLogOut() {
  window.localStorage.removeItem("userDoc");
  window.localStorage.removeItem("newParamsInputTypes");
  firebase_auth.signOut().then(() => {window.location.href = "/login"});
}

function getNewParams() {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/getAllNewParams";

  console.log("new params uri: " + uri);

  const request = async () => {
    let paramsDoc = {};
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        console.log("paramsDoc recebido -> ", JSON.stringify(data));
        paramsDoc = data;
      })
      .catch(function (error) {
        console.log(error);
      });

    return paramsDoc;
  };

  return request();

}

function mapParamsToInputType(paramsDoc){
  let inputTypesDoc = {};
  let parentParams = paramsDoc[newParametersEntities.parent[languageCode]];
  let childParams = paramsDoc[newParametersEntities.student[languageCode]];

  if(parentParams!=null){
    for(let p in parentParams){
      if(parentParams[p]===newParametersTypes.TEXT[languageCode]){
        const inputType = newParametersInputTypes.TEXT.type;
        const inputStep = newParametersInputTypes.TEXT.step;
        inputTypesDoc[p] = {type : inputType, step : inputStep};
      }
      else if(parentParams[p]===newParametersTypes.INT[languageCode]){
        const inputType = newParametersInputTypes.INT.type;
        const inputStep = newParametersInputTypes.INT.step;
        inputTypesDoc[p] = {type : inputType, step : inputStep}
      }
      else if(parentParams[p]===newParametersTypes.FLOAT[languageCode]){
        const inputType = newParametersInputTypes.FLOAT.type;
        const inputStep = newParametersInputTypes.FLOAT.step;
        inputTypesDoc[p] = {type : inputType, step : inputStep}
      }
    }
  }

  if(childParams!=null){
    for(let p in childParams){
      if(childParams[p]===newParametersTypes.TEXT[languageCode]){
        const inputType = newParametersInputTypes.TEXT.type;
        const inputStep = newParametersInputTypes.TEXT.step;
        inputTypesDoc[p] = {type : inputType, step : inputStep};
      }
      else if(childParams[p]===newParametersTypes.INT[languageCode]){
        const inputType = newParametersInputTypes.INT.type;
        const inputStep = newParametersInputTypes.INT.step;
        inputTypesDoc[p] = {type : inputType, step : inputStep}
      }
      else if(childParams[p]===newParametersTypes.FLOAT[languageCode]){
        const inputType = newParametersInputTypes.FLOAT.type;
        const inputStep = newParametersInputTypes.FLOAT.step;
        inputTypesDoc[p] = {type : inputType, step : inputStep}
      }
    }
  }

  return inputTypesDoc;
}

export {fetchUserDoc, userLogOut, mapParamsToInputType, getNewParams}

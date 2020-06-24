import {firebaseConfig, firestore, storageRef} from "../firebase-config";
import React from "react";
import {languageCode, parentsParameters} from "../utils/general_utils";


function checkEmailUsage(email) {

  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/getParent?" +
    "id=" + email;

  const request = async () => {
    let exists = false;
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into blob / file
      .then(function (resp) {
        console.log("email check resp -> " + JSON.stringify(resp));
        // if no error, then exists an account with that email
        if(resp.error==null){
          console.log("exists email");
          exists = true;
        }
        // when error, then no account with that email
        else{
          console.log("do not exists email");
          exists = false;
        }
      })
      .catch(function (error) {
        exists = null;
        console.log("Delete case error: " + error);
      });

    return exists;
  };

  return request();

}


export {checkEmailUsage}

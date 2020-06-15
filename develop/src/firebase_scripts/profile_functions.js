import {
  firebase_auth,
  firebaseConfig,
  firestore,
  storageRef,
} from "../firebase-config";
import {
  languageCode,
  newParametersEntities,
  newParametersInputTypes,
  newParametersTypes,
  parentsParameters,
  studentsParameters,
} from "../utils/general_utils";

import { v4 as uuidv4 } from "uuid";

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
  firebase_auth
    .signOut()
    .then(function () {
      // Sign-out successful.
      // clear local storage
      window.localStorage.removeItem("userDoc");
      window.localStorage.removeItem("newParamsInputTypes");
      window.localStorage.removeItem("assocDoc");
      window.localStorage.removeItem("admin");
      window.localStorage.removeItem("email");
      //window.localStorage.removeItem("emailForSignIn");
      window.location = "/login";
    })
    .catch(function (error) {
      // An error happened.
      console.log("Error logging out: " + error);
    });
}

function getNewParams() {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/getAllNewParams";

  //console.log("new params uri: " + uri);

  const request = async () => {
    let paramsDoc = {};
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        //console.log("paramsDoc recebido -> ", JSON.stringify(data));
        paramsDoc = data;
      })
      .catch(function (error) {
        console.log("erro no fetch de params: " + error);
      });

    return paramsDoc;
  };

  return request();
}

function mapParamsToInputType(paramsDoc) {
  let inputTypesDoc = {};
  let parentParams = paramsDoc[newParametersEntities.parent[languageCode]];
  let childParams = paramsDoc[newParametersEntities.student[languageCode]];

  let parentParamsTypes = {};
  let childParamsTypes = {};

  if (parentParams != null) {
    for (let p in parentParams) {
      if (parentParams[p] === newParametersTypes.TEXT[languageCode]) {
        const inputType = newParametersInputTypes.TEXT.type;
        const inputStep = newParametersInputTypes.TEXT.step;
        parentParamsTypes[p] = { type: inputType, step: inputStep };
      } else if (parentParams[p] === newParametersTypes.INT[languageCode]) {
        const inputType = newParametersInputTypes.INT.type;
        const inputStep = newParametersInputTypes.INT.step;
        parentParamsTypes[p] = { type: inputType, step: inputStep };
      } else if (parentParams[p] === newParametersTypes.FLOAT[languageCode]) {
        const inputType = newParametersInputTypes.FLOAT.type;
        const inputStep = newParametersInputTypes.FLOAT.step;
        parentParamsTypes[p] = { type: inputType, step: inputStep };
      }
    }

    inputTypesDoc[
      newParametersEntities.parent[languageCode]
    ] = parentParamsTypes;
  }

  if (childParams != null) {
    for (let p in childParams) {
      if (childParams[p] === newParametersTypes.TEXT[languageCode]) {
        const inputType = newParametersInputTypes.TEXT.type;
        const inputStep = newParametersInputTypes.TEXT.step;
        childParamsTypes[p] = { type: inputType, step: inputStep };
      } else if (childParams[p] === newParametersTypes.INT[languageCode]) {
        const inputType = newParametersInputTypes.INT.type;
        const inputStep = newParametersInputTypes.INT.step;
        childParamsTypes[p] = { type: inputType, step: inputStep };
      } else if (childParams[p] === newParametersTypes.FLOAT[languageCode]) {
        const inputType = newParametersInputTypes.FLOAT.type;
        const inputStep = newParametersInputTypes.FLOAT.step;
        childParamsTypes[p] = { type: inputType, step: inputStep };
      }
    }

    inputTypesDoc[
      newParametersEntities.student[languageCode]
    ] = childParamsTypes;
  }

  // like:  {"um parametro":{"type":"text","step":null},"Pólo":{"type":"text","step":null},"Modalidade":{"type":"text","step":null},"Regime":{"type":"text","step":null},"Grau":{"type":"number","step":"1"}}
  return inputTypesDoc;
}

function updateEducando(parentEmail, educandoDoc, oldName) {
  console.log("educandoDoc -> " + JSON.stringify(educandoDoc));

  let localUser = JSON.parse(window.localStorage.getItem("userDoc"));
  let children = localUser[parentsParameters.CHILDREN[languageCode]];

  for (let i in children) {
    let currentChild = children[i];
    // find child with that name to update it
    if (currentChild[studentsParameters.NAME[languageCode]] === oldName) {
      children[i] = educandoDoc;
      break;
    }
  }
  const childrenDesignation = parentsParameters.CHILDREN[languageCode];
  const newChildrenField = { [childrenDesignation]: children };

  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/updateParent?" +
    "id=" +
    parentEmail +
    "&doc=" +
    encodeURIComponent(JSON.stringify(newChildrenField));

  const request = async () => {
    let updatedParent = {};
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        console.log(
          "parentUpdated no request update child -> ",
          JSON.stringify(data)
        );
        updatedParent = data;
      })
      .catch(function (error) {
        console.log(error);
      });

    return updatedParent;
  };

  return request();
}

function updateParent(parentEmail, parentDoc) {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/updateParent?" +
    "id=" +
    parentEmail +
    "&doc=" +
    encodeURIComponent(JSON.stringify(parentDoc));

  const request = async () => {
    let updatedParent = {};
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        console.log(
          "parentUpdated no request update info -> ",
          JSON.stringify(data)
        );
        updatedParent = data;
      })
      .catch(function (error) {
        console.log(error);
      });

    return updatedParent;
  };

  return request();
}

function uploadProfilePhoto(photoFile) {
  // unique file name
  const newPhotoPath = "profilePhotos/" + uuidv4() + "-" + photoFile.name;
  const newPhotoRef = storageRef.child(newPhotoPath);
  return newPhotoRef.put(photoFile);
}

function uploadChildPhoto(photoFile) {
  // unique file name
  const newPhotoPath = "childPhotos/" + uuidv4() + "-" + photoFile.name;
  const newPhotoRef = storageRef.child(newPhotoPath);
  return newPhotoRef.put(photoFile);
}

function uploadAssocLogo(photoFile) {
  // unique file name
  const newPhotoPath = "logo/" + uuidv4() + "-" + photoFile.name;
  const newPhotoRef = storageRef.child(newPhotoPath);
  return newPhotoRef.put(photoFile);
}

/*
 * function to add a child to a parent
 * */
function addEducandoToParent(parentEmail, newChild, photo) {
  console.log("newChild received -> " + JSON.stringify(newChild));

  let childJson = newChild;
  childJson[studentsParameters.PHOTO[languageCode]] = photo;

  console.log("childJson with photo -> " + JSON.stringify(childJson));

  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/addEducando?" +
    "id=" +
    parentEmail +
    "&educando=" +
    encodeURIComponent(JSON.stringify(childJson));

  const request = async () => {
    let updatedParent = {};
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        console.log(
          "parentUpdated no request add child -> ",
          JSON.stringify(data)
        );
        updatedParent = data;
      })
      .catch(function (error) {
        console.log(error);
      });

    return updatedParent;
  };

  return request();

  /*
  let parentRef = firestore.collection('parents').doc(parentEmail);
  const childrenDesignation = parentsParameters.CHILDREN[languageCode];

  return parentRef.get()
    .then((doc) => {
      if (!doc.exists) {
        console.log('No such document for parent <' + parentEmail + '> !');
      }
      else {
        let parent = doc.data();

        let children = parent[childrenDesignation];
        console.log("children array -> " + JSON.stringify(children));
        children.push(childJson);
        console.log("children novo -> " + JSON.stringify(childJson));
        parent[childrenDesignation] = children;
        console.log("parent final -> " + JSON.stringify(parent));

        return parent;
      }
    })
    .then((parent) => {
      return parentRef.update({[childrenDesignation] : parent[childrenDesignation]})
        .then(() => {return parent});
    })
    .catch((err) => {
      console.log('Error getting parent <' + parentEmail + '> : ' + err);
    });*/
}

function deleteEducandoFromParent(parentEmail, childName) {
  console.log("childName to erase received -> " + childName);

  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/removeEducando?" +
    "id=" +
    encodeURIComponent(parentEmail) +
    "&nome_educando=" +
    encodeURIComponent(childName);

  const request = async () => {
    let updatedParent = {};
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        //console.log("parentUpdated no request delete child -> ", JSON.stringify(data));
        updatedParent = data;
      })
      .catch(function (error) {
        console.log(error);
      });

    return updatedParent;
  };

  return request();

  /*let parentRef = firestore.collection('parents').doc(parentEmail);
  const childrenDesignation = parentsParameters.CHILDREN[languageCode];

  return parentRef.get()
    .then((doc) => {
      if (!doc.exists) {
        console.log('No such document for parent <' + parentEmail + '> !');
      }
      else {
        let parent = doc.data();

        let children = parent[childrenDesignation];

        for(let i in children){
          const currentName = children[i][studentsParameters.NAME[languageCode]];
          console.log("currentName -> " + currentName);
          if(currentName===childName){
            console.log("SPLICE!");
            children.splice(i,1);
            break;
          }
        }

        console.log("children array novo -> " + JSON.stringify(children));
        parent[childrenDesignation] = children;
        console.log("parent final -> " + JSON.stringify(parent));

        return parent;
      }
    })
    .then((parent) => {
      return parentRef.update({[childrenDesignation] : parent[childrenDesignation]})
        .then(() => {return parent});
    })
    .catch((err) => {
      console.log('Error getting parent <' + parentEmail + '> : ' + err);
    });*/
}

/*
 * function to check if the current email exists in Firebase auth
 * */

function emailExistsInFBAuth(email) {
  return firebase_auth
    .fetchSignInMethodsForEmail(email)
    .then((providers) => {
      // if no providers, then user does no exist
      return !(!providers || providers.length === 0);
    })
    .catch((e) => {
      return false;
    });
}

/*
 * function to check if an email exists in DB
 * */
function emailExistsInDB(email) {
  console.log("email to check in DB: " + email);

  // in case of, for some reason, the current email is not in the DB
  let parentRef = firestore.collection("parents").doc(email);

  return parentRef
    .get()
    .then((doc) => {
      console.log("doc para DB <" + email + ">: " + JSON.stringify(doc.data()));
      if (!doc.exists) {
        console.log("doc para <" + email + "> não existe");
        return false;
      }
      return true;
    })
    .catch((error) => {
      console.log("erro para DB <" + email + ">: " + JSON.stringify(error));
      return false;
    });
}

function updateParentEmail(currentEmail, newEmail) {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/alterParentEmail?" +
    "email=" +
    encodeURIComponent(currentEmail) +
    "&new_email=" +
    encodeURIComponent(newEmail);

  const request = async () => {
    let updatedParent = {};
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        console.log(
          "parentUpdated no request update email -> ",
          JSON.stringify(data)
        );
        updatedParent = data;
      })
      .catch(function (error) {
        console.log(error);
      });

    return updatedParent;
  };

  return request();
}

/*
 * export PDF with parent data
 * */
function exportParentToPDF(email) {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/exportSingleParentPDF?" +
    "id=" +
    encodeURIComponent(email);

  const request = async () => {
    let file = new Blob();
    await fetch(uri)
      .then((resp) => resp.blob()) // Transform the data into blob / file
      .then(function (data) {
        console.log("Export PDF success");
        file = data;
      })
      .catch(function (error) {
        console.log("Export error: " + error);
      });

    return file;
  };

  return request();
}

/*
 * export CSV with parent data
 * */
function exportParentToCSV(email) {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/exportSingleParentCSV?" +
    "id=" +
    encodeURIComponent(email);

  const request = async () => {
    let file = null;
    await fetch(uri)
      .then((resp) => resp.blob()) // Transform the data into blob / file
      .then(function (data) {
        console.log("Export CSV success");
        file = data;
      })
      .catch(function (error) {
        console.log("Export error: " + error);
      });

    return file;
  };

  return request();
}

/*
 * export all parents data to a CSV
 * */
function exportAllParentsToCSV() {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/exportParentCSV";

  const request = async () => {
    let file = null;
    await fetch(uri)
      .then((resp) => resp.blob()) // Transform the data into blob / file
      .then(function (data) {
        console.log("Export parents CSV success");
        file = data;
      })
      .catch(function (error) {
        console.log("Export error: " + error);
      });

    return file;
  };

  return request();
}

/*
 * export all children data to a CSV
 * */
function exportAllChildrenToCSV() {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/exportEducandosCSV";

  const request = async () => {
    let file = null;
    await fetch(uri)
      .then((resp) => resp.blob()) // Transform the data into blob / file
      .then(function (data) {
        console.log("Export children CSV success");
        file = data;
      })
      .catch(function (error) {
        console.log("Export error: " + error);
      });

    return file;
  };

  return request();
}

/*
 * export cases to PDF
 * */
function exportAllCasosToPDF() {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/exportCasosPDF";

  const request = async () => {
    let file = new Blob();
    await fetch(uri)
      .then((resp) => resp.blob()) // Transform the data into blob / file
      .then(function (data) {
        console.log("Export PDF success");
        file = data;
      })
      .catch(function (error) {
        console.log("Export error: " + error);
      });

    return file;
  };

  return request();
}

/*
 * delete user account
 * */
function deleteAccount(email) {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/deleteAccount?" +
    "email=" +
    encodeURIComponent(email);

  const request = async () => {
    let deletedParent = {};
    await fetch(uri)
      .then((resp) => resp.json()) // Transform the data into blob / file
      .then(function (data) {
        if(data.error==null){
          console.log("Parent removed successfully");
        }
        else{
          console.log(data.error);
        }
        deletedParent = data;
      })
      .catch(function (error) {
        console.log("Delete account error: " + error);
      });

    return deletedParent;
  };

  return request();
}

function deleteAccountEmailNotification(nome, email) {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/sendAccountEliminationEmail?" +
    "email=" +
    email +
    "&" +
    "nome=" +
    nome;

  const request = async () => {
    await fetch(uri)
      .then()
      .catch(function (error) {
        console.log("Error sending account delete email: " + error);
      });
  };

  return request();
}

/*
 * send email to parent to notify it was imported to platform
 */
async function sendChangeEmailAuth(nome, email) {
  const project_id = firebaseConfig.projectId;
  let uri =
    "https://us-central1-" +
    project_id +
    ".cloudfunctions.net/api/sendAuthenticationEmailAfterEmailChange?" +
    "email=" +
    encodeURIComponent(email) +
    "&" +
    "nome=" +
    encodeURIComponent(nome);

  window.localStorage.setItem("emailForSignIn", email);

  const request = async () => {
    await fetch(uri)
      .then(() => {})
      .catch(function (error) {
        console.log("Error sending newEmail email: " + error);
      });
  };

  return request();
}

export {
  fetchUserDoc,
  userLogOut,
  mapParamsToInputType,
  getNewParams,
  addEducandoToParent,
  deleteEducandoFromParent,
  updateEducando,
  updateParent,
  uploadProfilePhoto,
  uploadChildPhoto,
  emailExistsInFBAuth,
  emailExistsInDB,
  updateParentEmail,
  sendChangeEmailAuth,
  exportParentToPDF,
  exportParentToCSV,
  exportAllParentsToCSV,
  exportAllChildrenToCSV,
  deleteAccount,
  uploadAssocLogo,
  exportAllCasosToPDF,
  deleteAccountEmailNotification,
};

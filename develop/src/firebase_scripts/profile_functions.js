import {
  firebase_auth,
  firebaseConfig,
  storage,
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
  firebase_auth
    .signOut()
    .then(function () {
      // Sign-out successful.
      window.location = "/login";
    })
    .catch(function (error) {
      // An error happened.
      console.log(error);
    });
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
  const newPhotoPath = "profilePhotos/" + photoFile.name;
  const newPhotoRef = storageRef.child(newPhotoPath);
  return newPhotoRef.put(photoFile);
}

function uploadChildPhoto(photoFile) {
  const newPhotoPath = "childPhotos/" + photoFile.name;
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
};

import {
  firebase_auth,
  firebaseConfig,
  firestore,
  storageRef
} from "../firebase-config";


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
    let userDoc;
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


export {fetchUserDoc}

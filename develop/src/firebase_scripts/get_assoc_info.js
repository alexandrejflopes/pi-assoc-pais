import { firestore } from "../firebase-config";


function getAssocDoc() {
  return firestore.doc("initialConfigs/parameters").get();
}



export {getAssocDoc} ;





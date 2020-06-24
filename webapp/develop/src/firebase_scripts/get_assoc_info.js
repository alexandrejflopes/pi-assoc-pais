import { firestore } from "../firebase-config";

/*
* function to get association info
* */
function getAssocDoc() {
  return firestore.doc("initialConfigs/parameters").get();
}

/*
* function to update association data.
* It receives a JSON corresponding to whole doc or only
* part of it with only the fields to update
* */
function updateAssocDoc(docFields) {
  return firestore.doc("initialConfigs/parameters").update(docFields);
}


export {getAssocDoc, updateAssocDoc} ;





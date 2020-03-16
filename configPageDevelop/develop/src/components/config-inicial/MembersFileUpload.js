import React from "react";
import {FormFeedback} from "shards-react";

const MembersFileUpload = () => (
  <div className="custom-file mb-3">
    <input id="configAssocMembers" type="file" className="custom-file-input" accept=".csv" required/>
    <label className="custom-file-label" htmlFor="customFile2">
      Escolha um ficheiro...
    </label>
    <FormFeedback id="configAssocMembersFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
  </div>
);

export default MembersFileUpload;

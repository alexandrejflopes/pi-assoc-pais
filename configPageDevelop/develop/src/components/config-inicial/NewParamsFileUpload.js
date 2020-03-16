import React from "react";
import {FormFeedback, FormGroup} from "shards-react";

const NewParamsFileUpload = () => (
  <div className="custom-file mb-3">
    <input id="configAssocNewParams" type="file" className="custom-file-input" accept="text/*" required/>
    <label className="custom-file-label" htmlFor="customFile2">
      Escolha um ficheiro...
    </label>
    <FormFeedback id="configAssocNewParamsFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
  </div>
);

export default NewParamsFileUpload;

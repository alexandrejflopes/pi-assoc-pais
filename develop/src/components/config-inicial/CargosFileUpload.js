import React from "react";
import {FormFeedback} from "shards-react";

const CargosFileUpload = () => (
  <div className="custom-file mb-3">
    <input id="configAssocCargos" type="file" className="custom-file-input" accept="text/plain" required/>
    <label className="custom-file-label" htmlFor="customFile2">
      Escolha um ficheiro...
    </label>
    <FormFeedback id="configAssocCargosFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
  </div>
);

export default CargosFileUpload;

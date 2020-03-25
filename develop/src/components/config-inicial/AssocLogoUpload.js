import React from "react";
import {FormFeedback, FormGroup} from "shards-react";

const AssocLogoUpload = () => (
  <div className="custom-file mb-3">
    <input id="configAssocLogo" type="file" className="custom-file-input" accept="image/png, image/jpeg, image/svg" required/>
    <label className="custom-file-label" htmlFor="customFile2">
      Escolha uma imagem...
    </label>
    <FormFeedback id="configAssocLogoFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
  </div>
);

export default AssocLogoUpload;

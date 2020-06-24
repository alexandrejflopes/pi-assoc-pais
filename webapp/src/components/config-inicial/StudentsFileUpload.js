import React from "react";
import {FormFeedback, FormGroup} from "shards-react";

const StudentsFileUpload = () => (
  <div className="custom-file mb-3">
    <input id="configAssocStudents" type="file" className="custom-file-input" accept=".csv" required/>
    <label className="custom-file-label" htmlFor="customFile2">
      Escolha um ficheiro...
    </label>
    <FormFeedback id="configAssocStudentsFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
  </div>
);

export default StudentsFileUpload;

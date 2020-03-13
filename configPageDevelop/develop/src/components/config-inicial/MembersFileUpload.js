import React from "react";

const MembersFileUpload = () => (
  <div className="custom-file mb-3">
    <input type="file" className="custom-file-input" id="customFile2" accept=".csv"/>
    <label className="custom-file-label" htmlFor="customFile2">
      Escolha um ficheiro...
    </label>
  </div>
);

export default MembersFileUpload;

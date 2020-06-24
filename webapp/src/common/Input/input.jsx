import React from "react";
import { FormGroup, Input, Label } from "reactstrap";
const InputForm = ({ name, label, error, width, ...rest }) => {
  return (
    <FormGroup style={{ paddingRight: "10px", width: width }}>
      <Label>{label}</Label>
      <Input {...rest} name={name} />
      {error && <div className="alert alert-danger">{error}</div>}
    </FormGroup>
  );
};

export default InputForm;

import React, { Component } from "react";
import { Button } from "react-bootstrap";
import InputForm from "../Input/input";
const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);
class Form extends Component {
  state = { credentials: {}, errors: {} };

  validate() {
    const { credentials, errors } = { ...this.state };
    console.log("Credenciais: " + JSON.stringify(credentials));
    var error = false;
    for (let [name, value] of Object.entries(credentials)) {
      switch (name) {
        case "name":
          value.length < 3 ? (error = true) : (error = false);

          break;
        case "email":
          validEmailRegex.test(value) ? (error = false) : (error = true);
          break;
        case "password":
          value.length < 3 ? (error = true) : (error = false);
          break;
        case "repeatPassword":
          value !== this.state.credentials.password || value === ""
            ? (error = true)
            : (error = false);
          break;
        default:
          break;
      }
    }
    if (!error) return false;
    else return true;
  }
  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const errors = { ...this.state.errors };
    switch (name) {
      case "name":
        errors.name =
          value.length < 3 ? "Name must be 3 characters long!" : null;
        break;
      case "email":
        errors.email = validEmailRegex.test(value)
          ? null
          : "Email is not valid!";
        break;
      case "password":
        errors.password =
          value.length < 3 ? "Password must be 3 characters long!" : null;
        break;
      case "repeatPassword":
        errors.repeatPassword =
          value !== this.state.credentials.password || value === ""
            ? "Passwords don't match"
            : null;
        break;
      default:
        break;
    }
    return errors[name];
  };

  handleChange = ({ currentTarget: input }) => {
    console.log("Aqui -> " + input.value);
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];

    const credentials = { ...this.state.credentials };
    credentials[input.name] = input.value;
    this.setState({ credentials, errors });
  };
  renderButton(label) {
    var validation = this.validate();
    console.log("Validation: " + validation);
    return (
      <Button
        type="submit"
        style={{
          background: "#34b4eb",
          color: "#fff",
          width: "200px",
          textAlign: "center",
        }}
        disabled={validation}
      >
        {label}
      </Button>
    );
  }
  renderInput(name, type, label, placeholder = "Password here...") {
    const { credentials, errors } = this.state;
    console.log("Credenciais1: " + JSON.stringify(credentials));
    return (
      <InputForm
        type={type}
        name={name}
        value={credentials[name]}
        placeholder={placeholder}
        label={label}
        onChange={this.handleChange}
        error={errors[name]}
      />
    );
  }
}

export default Form;

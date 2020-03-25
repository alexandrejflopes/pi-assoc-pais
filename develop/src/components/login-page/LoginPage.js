import React, { Component, Fragment } from "react";
import {
  Col,
  Row,
  Button,
  Form,
  FormGroup,
  FormFeedback,
  Input
} from "reactstrap";
import { Link } from "react-router-dom";
import BlockUi from "react-block-ui";
import { Loader } from "react-loaders";
import { firestore, firebase_auth, firebase } from "../../firebase-config";

//import * as UsersService from "../../services/users/api_user";
import CostumForm from "../../common/Form/form";
import bg1 from "../../assets/mother.png";

class Login extends CostumForm {
  constructor(props) {
    super(props);
    this.state = {
      blocking: false,
      credentials: {
        email: "",
        password: ""
      },
      errors: {}
    };

    this.googleSignIn = this.googleSignIn.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

    // const user = UsersService.getCurrentUser();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/

  googleSignIn() {
    console.log("googleSignIn");
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        console.log(result);
        console.log("Success... Google Account Linked");
        //Login com sucesso
        window.location = "/";
      })
      .catch(function(error) {
        console.log(error);
        console.log("Failed to log in with google");
      });
  }

  doSubmit = async e => {
    e.preventDefault();

    const { credentials } = this.state;

    const data = {};
    //const data = await UsersService.login(credentials);

    firebase
      .auth()
      .getRedirectResult()
      .then(function(result) {
        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // ...
        }
        // The signed-in user info.
        var user = result.user;
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });

    //Passar para api_user.js
    const userDoc = firestore.doc("initialConfigs/defaultUser");
    userDoc
      .get()
      .then(doc => {
        console.log("doc -> ", doc);

        if (doc.exists === false) {
        } else {
          const dataDoc = doc.data();
          if (
            credentials.email == dataDoc.email &&
            credentials.password == dataDoc.password
          ) {
            //Login com sucesso
            window.location = "/";
          } else {
            alert("Falha no login! Valores inseridos estão errados");
          }
        }
      })
      .catch(err => {
        alert(err);
      });
  };

  render() {
    return (
      <Fragment>
        <BlockUi
          tag="div"
          blocking={this.state.blocking}
          loader={<Loader active type="line-scale-pulse-out" />}
        >
          <div className="h-100 bg-animation">
            <div
              className="d-flex h-100 justify-content-center align-items-center"
              style={{
                background: "url(" + bg1 + ")",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center center"
              }}
            >
              <Col md="8" className="mx-auto app-login-box">
                <div
                  className="modal-dialog w-100 mx-auto"
                  style={{
                    boxShadow: "0px 1px 10px 0px rgba(52, 58, 64, 0.3)"
                  }}
                >
                  <div className="modal-content" style={{ border: "none" }}>
                    <div className="modal-body" style={{ padding: "2.5rem" }}>
                      <div className="h6 modal-title text-center mb-4">
                        <img
                          className="mb-4"
                          src={bg1}
                          style={{ height: "100px", width: "auto" }}
                        />
                        <p>Insira os seus dados</p>
                      </div>
                      <Form onSubmit={this.doSubmit}>
                        <Row form>
                          <Col md={12}>
                            {this.renderInput(
                              "email",
                              "email",
                              "Email",
                              "Insira o email"
                            )}
                          </Col>
                          <Col md={12}>
                            {this.renderInput(
                              "password",
                              "password",
                              "Password",
                              "Password"
                            )}
                          </Col>
                          <Col md={12} style={{ textAlign: "center" }}>
                            {this.renderButton("Login")}
                          </Col>

                          <Col md={12} style={{ textAlign: "center" }}>
                            <br></br>

                            <h5 className="mb-0">
                              Não tem conta?{" "}
                              <Link to="/register" className="text-primary">
                                Registe-se
                              </Link>
                            </h5>
                          </Col>
                        </Row>
                      </Form>
                      <Col md={12} style={{ textAlign: "center" }}>
                        <Button
                          onClick={this.googleSignIn}
                          style={{
                            background: "#34b4eb",
                            color: "#fff",
                            width: "200px",
                            textAlign: "center"
                          }}
                        >
                          {"Sign In With Google"}
                        </Button>
                      </Col>
                    </div>
                  </div>
                </div>
                <div className="text-center text-black opacity-8 mt-3">
                  Copyright &copy;
                </div>
              </Col>
            </div>
          </div>
        </BlockUi>
      </Fragment>
    );
  }
}

export default Login;

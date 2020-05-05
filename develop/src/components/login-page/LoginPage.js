import React, { Component, Fragment } from "react";
import {
  Col,
  Row,
  Button,
  Form,
  FormGroup,
  FormFeedback,
  Input,
} from "reactstrap";
import { Link, Redirect } from "react-router-dom";
import BlockUi from "react-block-ui";
import { Loader } from "react-loaders";
import { firestore, firebase_auth, firebase } from "../../firebase-config";

//import * as UsersService from "../../services/users/api_user";
import CostumForm from "../../common/Form/form";
import bg1 from "../../assets/mother.png";
import { languageCode, parentsParameters } from "../../utils/general_utils";

class Login extends CostumForm {
  constructor(props) {
    super(props);

    var msg = this.props.msg;
    if (msg == undefined) {
      msg = null;
    } else {
      const hStyle = { color: "green" };

      msg = (
        <div>
          <p style={hStyle}>{msg}</p>
        </div>
      );
    }

    this.state = {
      blocking: false,
      credentials: {
        email: "",
        password: "",
      },
      errors: {},
      redirect: null,
      msg: msg,
    };

    this.googleSignIn = this.googleSignIn.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;
    // const user = UsersService.getCurrentUser();

    const this_ = this;

    window.localStorage.removeItem("admin");
    window.localStorage.removeItem("email");

    const currentUser = firebase_auth.currentUser;

    if (currentUser != null) {
      alert(currentUser.email);
      var email = currentUser.email;
      const userDoc = firestore.collection("parents").doc(currentUser.email);
      userDoc
        .get()
        .then((doc) => {
          if (doc.exists === false) {
            alert("Utilizador não registado!");
          } else {
            const dataDoc = doc.data();
            if (email == dataDoc.Email && dataDoc["Validated"] == false) {
              var red;
              if (dataDoc["Quotas pagas"] == "Não") {
                red = (
                  <Redirect
                    to={{
                      pathname: "/payment",
                      state: { Email: dataDoc.Email, payment: false },
                    }}
                  />
                );
              } else {
                red = (
                  <Redirect
                    to={{
                      pathname: "/payment",
                      state: { Email: dataDoc.Email, payment: true },
                    }}
                  />
                );
              }
              //Redirecionar para página de pagamento
              this_.setState({ redirect: red });
            } else if (email == dataDoc.Email && dataDoc["Validated"] == true) {
              if (
                dataDoc.Admin != undefined &&
                dataDoc.Admin != null &&
                dataDoc.Admin === true
              ) {
                window.localStorage.setItem("admin", dataDoc.Admin.toString());
              }
              window.localStorage.setItem("email", dataDoc.Email);

              var red = (
                <Redirect
                  to={{
                    pathname: "/profile",
                    state: { userEmail: currentUser.email, userProvided: true },
                  }}
                />
              );
              this_.setState({ redirect: red });
            }
          }
        })
        .catch((err) => {
          alert(err);
        });
    } else if (firebase_auth.isSignInWithEmailLink(window.location.href)) {
      var email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt(
          "Por favor, forneça o seu email para confirmação."
        );
      }
      firebase
        .auth()
        .signInWithEmailLink(email, window.location.href)
        .then(function (result) {
          // Clear email from storage.
          window.localStorage.removeItem("emailForSignIn");

          const userDoc = firestore.collection("parents").doc(email);
          userDoc
            .get()
            .then((doc) => {
              if (doc.exists === false) {
                alert("Utilizador não registado!");
              } else {
                const dataDoc = doc.data();
                console.log("dataDoc: " + JSON.stringify(dataDoc));
                if (email === dataDoc.Email && dataDoc["Validated"] === false) {
                  var red;
                  if (
                    dataDoc[parentsParameters.PAYED_FEE[languageCode]] === false
                  ) {
                    red = (
                      <Redirect
                        to={{
                          pathname: "/payment",
                          state: { Email: dataDoc.Email, payment: false },
                        }}
                      />
                    );
                  } else {
                    red = (
                      <Redirect
                        to={{
                          pathname: "/payment",
                          state: { Email: dataDoc.Email, payment: true },
                        }}
                      />
                    );
                  }
                  //Redirecionar para página de pagamento
                  this_.setState({ redirect: red });
                } else if (
                  email === dataDoc.Email &&
                  dataDoc["Validated"] === true
                ) {
                  if (
                    dataDoc.Admin != undefined &&
                    dataDoc.Admin != null &&
                    dataDoc.Admin === true
                  ) {
                    window.localStorage.setItem(
                      "admin",
                      dataDoc.Admin.toString()
                    );
                  }
                  window.localStorage.setItem("email", dataDoc.Email);

                  var red = (
                    <Redirect
                      to={{
                        pathname: "/profile",
                        state: { userEmail: email, userProvided: true },
                      }}
                    />
                  );
                  this_.setState({ redirect: red });
                }
              }
            })
            .catch((err) => {
              alert(err);
            });
        })
        .catch(function (error) {
          // Some error occurred, you can inspect the code: error.code
          // Common errors could be invalid email and invalid or expired OTPs.
          alert("Erro: " + error);
        });
    }
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
      .then(function (result) {
        console.log("auth result: " + result);
        /*
         * TODO: verificar se o este email já existe
         *  - se não existe, apagar o registo feito (apagar o user)
         * */
        console.log("Success... Google Account Linked");
        //Login com sucesso
        window.location = "/user-profile-lite";
      })
      .catch(function (error) {
        console.log(error);
        console.log("Failed to log in with google");
      });
  }

  doSubmit = async (e) => {
    e.preventDefault();

    const { credentials } = this.state;

    const data = {};

    if (credentials.email === "") {
      alert("Insira o seu email!");
    } else {
      firebase
        .auth()
        .getRedirectResult()
        .then(function (result) {
          if (result.credential) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // ...
          }
          // The signed-in user info.
          var user = result.user;
          //console.dir("User login: " + JSON.stringify(result));
        })
        .catch(function (error) {
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
      //console.log(credentials.email);
      const userDoc = firestore.collection("parents").doc(credentials.email);
      userDoc
        .get()
        .then((doc) => {
          //console.log("doc -> ", doc);

          if (doc.exists === false) {
            alert("Utilizador não registado!");
          } else {
            const dataDoc = doc.data();
            if (
              credentials.email === dataDoc.Email &&
              dataDoc["Validated"] === false
            ) {
              let uri =
                "https://us-central1-associacao-pais.cloudfunctions.net/api/sendAuthenticationEmail?" +
                "email=" +
                dataDoc.Email +
                "&" +
                "nome=" +
                dataDoc.Nome;
              const request = async () => {
                let resposta;
                await fetch(uri)
                  .then((resp) => resp.json()) // Transform the data into json
                  .then(function (data) {
                    resposta = data;
                  })
                  .catch(function (error) {});

                return resposta;
              };

              request();

              const hStyle = { color: "green" };

              var mensagem = (
                <div>
                  <p style={hStyle}>
                    Foi-lhe enviado email com link para efetuar o login
                  </p>
                </div>
              );
              this.setState({ msg: mensagem });
            } else if (
              credentials.email === dataDoc.Email &&
              dataDoc["Validated"] === true
            ) {
              let uri =
                "https://us-central1-associacao-pais.cloudfunctions.net/api/sendAuthenticationEmail?" +
                "email=" +
                dataDoc.Email +
                "&" +
                "nome=" +
                dataDoc.Nome;
              const request = async () => {
                let resposta;
                await fetch(uri)
                  .then((resp) => resp.json()) // Transform the data into json
                  .then(function (data) {
                    resposta = data;
                  })
                  .catch(function (error) {});

                return resposta;
              };

              request();

              const hStyle = { color: "green" };

              var mensagem = (
                <div>
                  <p style={hStyle}>
                    Foi-lhe enviado email com link para efetuar o login
                  </p>
                </div>
              );
              this.setState({ msg: mensagem });
            } else {
              alert("Falha no login! Valores inseridos estão errados");
            }
          }
        })
        .catch((err) => {
          alert(err);
        });
    }
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
                backgroundPosition: "center center",
              }}
            >
              <Col md="8" className="mx-auto app-login-box">
                <div
                  className="modal-dialog w-100 mx-auto"
                  style={{
                    boxShadow: "0px 1px 10px 0px rgba(52, 58, 64, 0.3)",
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

                      {this.state.msg}

                      <Form onSubmit={this.doSubmit}>
                        <Row form>
                          <Col
                            md={12}
                            style={
                              this.state.msg
                                ? { margin: "8px" }
                                : { margin: "0px" }
                            }
                          >
                            {this.renderInput(
                              "email",
                              "email",
                              "Email",
                              "Insira o email"
                            )}
                          </Col>

                          <Col md={12} style={{ textAlign: "center" }}>
                            <Button
                              style={{
                                background: "#34b4eb",
                                color: "#fff",
                                width: "200px",
                                textAlign: "center",
                                margin: "8px",
                              }}
                            >
                              <i /> Sign In with Link
                            </Button>
                          </Col>

                          <Col md={12} style={{ textAlign: "center" }}>
                            <Button
                              onClick={this.googleSignIn}
                              style={{
                                background: "#34b4eb",
                                color: "#fff",
                                width: "200px",
                                textAlign: "center",
                              }}
                            >
                              {"Sign In With Google"}
                            </Button>
                          </Col>

                          <Col md={12} style={{ textAlign: "center" }}>
                            <br></br>

                            <h5 className="mb-0">
                              Não tem conta?{" "}
                              <Link to="/register" className="text-primary">
                                Registe-se
                              </Link>
                            </h5>
                            <br></br>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  </div>
                </div>
                <div className="text-center text-black opacity-8 mt-3">
                  Copyright &copy;
                </div>
                {this.state.redirect}
              </Col>
            </div>
          </div>
        </BlockUi>
      </Fragment>
    );
  }
}

export default Login;

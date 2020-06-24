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
import {
  firestore,
  firebase_auth,
  firebase,
  firebaseConfig,
} from "../../firebase-config";
import { toast, Bounce } from "react-toastify";

//import * as UsersService from "../../services/users/api_user";
import CostumForm from "../../common/Form/form";
import bg1 from "../../assets/mother.png";
import {
  languageCode,
  parentsParameters,
  showToast,
  toastTypes,
} from "../../utils/general_utils";
import {
  errorLoginFB,
  errorLoginGoogle,
  errorNoLogedInUser,
} from "../../utils/messages_strings";
import {
  signInWithFacebook,
  signInWithGoogle,
  signInWithLink,
  signInWithMicrosoft,
} from "../../utils/common_strings";

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
    this.FBSignIn = this.FBSignIn.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;
    // const user = UsersService.getCurrentUser();

    const this_ = this;

    window.localStorage.removeItem("admin");
    window.localStorage.removeItem("email");

    const currentUser = firebase_auth.currentUser;

    const project_id = firebaseConfig.projectId;

    if (currentUser != null) {
      //alert(currentUser.email);
      var email = currentUser.email;
      let uri =
        "https://us-central1-" +
        project_id +
        ".cloudfunctions.net/api/getParent?" +
        "id=" +
        email;
      const request = async () => {
        let resposta;
        await fetch(uri)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function (data) {
            var dataDoc = data;

            //console.log(data);
            if (dataDoc === undefined) {
              showToast(
                errorNoLogedInUser[languageCode],
                3000,
                toastTypes.WARNING
              );
            } else {
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
                      state: {
                        userEmail: currentUser.email,
                        userProvided: true,
                      },
                    }}
                  />
                );
                this_.setState({ redirect: red });
              }
            }
          })
          .catch(function (error) {
            //console.log("error3");
            alert(error);
          });
        return resposta;
      };

      var dados = request();
    } else if (firebase_auth.isSignInWithEmailLink(window.location.href)) {
      var email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt(
          "Por favor, forneça o seu email para confirmação."
        );
      }
      var message = "A carregar...";
      toast.configure();
      toast(message, {
        transition: Bounce,
        closeButton: true,
        autoClose: 10000,
        position: "top-right",
        type: "info",
      });

      firebase
        .auth()
        .signInWithEmailLink(email, window.location.href)
        .then(function (result) {
          // Clear email from storage.
          window.localStorage.removeItem("emailForSignIn");

          let uri =
            "https://us-central1-" +
            project_id +
            ".cloudfunctions.net/api/getParent?" +
            "id=" +
            email;
          const request = async () => {
            let resposta;
            await fetch(uri)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function (data) {
                console.log(data);
                if (data === undefined || data.error) {
                  var message = errorNoLogedInUser[languageCode];
                  toast.configure();
                  toast(message, {
                    transition: Bounce,
                    closeButton: true,
                    autoClose: 2000,
                    position: "top-right",
                    type: "warning",
                  });
                } else {
                  if (email == data.Email && data["Validated"] == false) {
                    var red;
                    if (
                      data[parentsParameters.PAYED_FEE[languageCode]] === false
                    ) {
                      red = (
                        <Redirect
                          to={{
                            pathname: "/payment",
                            state: { Email: data.Email, payment: false },
                          }}
                        />
                      );
                    } else {
                      red = (
                        <Redirect
                          to={{
                            pathname: "/payment",
                            state: { Email: data.Email, payment: true },
                          }}
                        />
                      );
                    }
                    //Redirecionar para página de pagamento
                    this_.setState({ redirect: red });
                  } else if (email == data.Email && data["Validated"] == true) {
                    if (
                      data.Admin != undefined &&
                      data.Admin != null &&
                      data.Admin === true
                    ) {
                      window.localStorage.setItem(
                        "admin",
                        data.Admin.toString()
                      );
                    }
                    window.localStorage.setItem("email", data.Email);

                    var red = (
                      <Redirect
                        to={{
                          pathname: "/profile",
                          state: {
                            userEmail: email,
                            userProvided: true,
                          },
                        }}
                      />
                    );
                    this_.setState({ redirect: red });
                  }
                }
              })
              .catch(function (error) {
                alert(error);
              });
            return resposta;
          };

          var dados = request();
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
    const this_ = this;
    const project_id = firebaseConfig.projectId;

    var provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        var email = result.user.email;

        var message = "A carregar...";
        toast.configure();
        toast(message, {
          transition: Bounce,
          closeButton: true,
          autoClose: 5000,
          position: "top-right",
          type: "info",
        });

        let uri =
          "https://us-central1-" +
          project_id +
          ".cloudfunctions.net/api/getParent?" +
          "id=" +
          email;
        const request = async () => {
          let resposta;
          await fetch(uri)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function (data) {
              var dataDoc = data;

              if (dataDoc === undefined || dataDoc.error) {
                var message = errorNoLogedInUser[languageCode];
                toast.configure();
                toast(message, {
                  transition: Bounce,
                  closeButton: true,
                  autoClose: 2000,
                  position: "top-right",
                  type: "warning",
                });
                //Sign out por precaução
                firebase_auth
                  .signOut()
                  .then(function () {
                    // Sign-out successful.
                  })
                  .catch(function (error) {});
              } else {
                if (email == dataDoc.Email && dataDoc["Validated"] == false) {
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
                  email == dataDoc.Email &&
                  dataDoc["Validated"] == true
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
                        state: {
                          userEmail: email,
                          userProvided: true,
                        },
                      }}
                    />
                  );
                  this_.setState({ redirect: red });
                }
              }
            })
            .catch(function (error) {
              console.log("error1");
              alert(error);
            });
          return resposta;
        };

        var dados = request();
      })
      .catch(function (error) {
        console.log(error);
        var message = errorLoginGoogle[languageCode];
        toast.configure();
        toast(message, {
          transition: Bounce,
          closeButton: true,
          autoClose: 2000,
          position: "top-right",
          type: "error",
        });
      });
  }

  FBSignIn() {
    const this_ = this;
    const project_id = firebaseConfig.projectId;
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        var email = result.user.email;

        let uri =
          "https://us-central1-" +
          project_id +
          ".cloudfunctions.net/api/getParent?" +
          "id=" +
          email;
        const request = async () => {
          let resposta;
          await fetch(uri)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function (data) {
              var dataDoc = data;

              if (dataDoc === undefined || dataDoc.error) {
                var message = errorNoLogedInUser[languageCode];
                toast.configure();
                toast(message, {
                  transition: Bounce,
                  closeButton: true,
                  autoClose: 2000,
                  position: "top-right",
                  type: "warning",
                });
                //Sign out por precaução
                firebase_auth
                  .signOut()
                  .then(function () {
                    // Sign-out successful.
                  })
                  .catch(function (error) {});
              } else {
                if (email == dataDoc.Email && dataDoc["Validated"] == false) {
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
                  email == dataDoc.Email &&
                  dataDoc["Validated"] == true
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
                        state: {
                          userEmail: email,
                          userProvided: true,
                        },
                      }}
                    />
                  );
                  this_.setState({ redirect: red });
                }
              }
            })
            .catch(function (error) {
              console.log("error1");
              alert(error);
            });
          return resposta;
        };

        var dados = request();
      })
      .catch(function (error) {
        console.log(error);
        var message = errorLoginFB[languageCode];
        toast.configure();
        toast(message, {
          transition: Bounce,
          closeButton: true,
          autoClose: 2000,
          position: "top-right",
          type: "error",
        });
      });
  }

  doSubmit = async (e) => {
    e.preventDefault();

    const { credentials } = this.state;
    const this_ = this;
    const project_id = firebaseConfig.projectId;

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
      var message = "A carregar...";
      toast.configure();
      toast(message, {
        transition: Bounce,
        closeButton: true,
        autoClose: 5000,
        position: "top-right",
        type: "info",
      });

      let uri =
        "https://us-central1-" +
        project_id +
        ".cloudfunctions.net/api/getParent?" +
        "id=" +
        credentials.email;
      const request = async () => {
        let resposta;
        await fetch(uri)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function (data) {
            var dataDoc = data;
            //console.log(data);
            if (dataDoc === undefined) {
              var message = errorNoLogedInUser[languageCode];
              toast.configure();
              toast(message, {
                transition: Bounce,
                closeButton: true,
                autoClose: 2000,
                position: "top-right",
                type: "warning",
              });
            } else {
              if (
                credentials.email === dataDoc.Email &&
                dataDoc["Validated"] === false
              ) {
                let uri =
                  "https://us-central1-" +
                  project_id +
                  ".cloudfunctions.net/api/sendAuthenticationEmail?" +
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
                this_.setState({ msg: mensagem });
              } else if (
                credentials.email === dataDoc.Email &&
                dataDoc["Validated"] === true
              ) {
                let uri =
                  "https://us-central1-" +
                  project_id +
                  ".cloudfunctions.net/api/sendAuthenticationEmail?" +
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
                this_.setState({ msg: mensagem });
              } else {
                showToast(
                  errorNoLogedInUser[languageCode],
                  3000,
                  toastTypes.WARNING
                );
              }
            }
          })
          .catch(function (error) {
            //console.log("error2");
            alert(error);
          });
        return resposta;
      };

      var dados = request();
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

                          <Col
                            md={12}
                            style={{ textAlign: "center", margin: "3px" }}
                          >
                            <Button
                              color="info"
                              style={{
                                width: "200px",
                                textAlign: "center",
                              }}
                            >
                              <i
                                className="fas fa-envelope"
                                style={{ marginRight: "10px" }}
                              />
                              {signInWithLink[languageCode]}
                            </Button>
                          </Col>

                          <Col
                            md={12}
                            style={{ textAlign: "center", margin: "3px" }}
                          >
                            <Button
                              color="danger"
                              onClick={this.googleSignIn}
                              style={{
                                width: "200px",
                                textAlign: "center",
                              }}
                            >
                              <i
                                className="fab fa-google"
                                style={{ marginRight: "10px" }}
                              />
                              {signInWithGoogle[languageCode]}
                            </Button>
                          </Col>

                          <Col
                            md={12}
                            style={{ textAlign: "center", margin: "3px" }}
                          >
                            <Button
                              color="primary"
                              onClick={this.FBSignIn}
                              style={{
                                width: "200px",
                                textAlign: "center",
                              }}
                            >
                              <i
                                className="fab fa-facebook-f"
                                style={{ marginRight: "10px" }}
                              />
                              {signInWithFacebook[languageCode]}
                            </Button>
                          </Col>

                          {/*<Col md={12} style={{ textAlign: "center", margin : "3px" }}>
                            <Button
                              color="success"
                              onClick={() => {}}
                              style={{
                                width: "200px",
                                textAlign: "center",
                              }}
                            >
                              <i className="fab fa-microsoft" style={{marginRight: "10px"}}/>
                              {signInWithMicrosoft[languageCode]}
                            </Button>
                          </Col>*/}

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

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
import { FormInput } from "shards-react";
import { Link, Redirect } from "react-router-dom";
import BlockUi from "react-block-ui";
import { Loader } from "react-loaders";
import { firestore, firebase_auth, firebase } from "../../firebase-config";

//import * as UsersService from "../../services/users/api_user";
import CostumForm from "../../common/Form/form";
import bg1 from "../../assets/mother.png";
import {languageCode, parentsParameters} from "../../utils/general_utils";

class Payment_Page extends CostumForm {
  constructor(props) {
    super(props);

    var json = JSON.stringify(this.props);

    var email = this.props.email;
    var payment = this.props.payment;

    if (email == null) {
      email = "redirect";
    }

    this.state = {
      blocking: true,
      Email: email,
      payment: payment,
      errors: {},
      refresh: null,
    };

    this.LoginReturn = this.LoginReturn.bind(this);

    //console.log("JSON: " + json);
    //console.log("state: " + JSON.stringify(this.props.match.params));
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

  LoginReturn() {
    firebase_auth
      .signOut()
      .then(function () {
        // Sign-out successful.
        window.location = "/login";
      })
      .catch(function (error) {
        // An error happened.
        alert("Erro ao efetuar logout");
      });
  }
  doSubmit = async (e) => {
    e.preventDefault();

    const { Email } = this.state;
    const this_ = this;

    //Escrever na base de dados no doc parents/<email> que firstPayment=true;
    var ref = firestore.collection("parents").doc(Email);

    let docPart = {};
    docPart[parentsParameters.PAYED_FEE[languageCode]] = true;

    return ref
      .update(docPart)
      .then(function () {
        console.log("Document successfully updated!");
        var refresh = (
          <Redirect
            to={{
              pathname: "/payment",
              state: { Email: Email, payment: true },
            }}
          />
        );
        this_.setState({ payment: true, refresh: refresh });
      })
      .catch(function (error) {
        // The document probably doesn't exist.
        //console.error("Error updating document: ", error);
        alert("Erro no envio, por favor, volte a tentar");
      });
  };

  render() {
    if (this.state.Email === "redirect") {
      return <Redirect to="/login" />;
    } else {
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
                          <p>Se efetuou o pagamento, confirme-o!</p>
                        </div>
                        <Form onSubmit={this.doSubmit}>
                          <Row form>
                            <Col md={12}>
                              <FormGroup>
                                <label htmlFor="email">Email</label>
                                <FormInput
                                  id="email"
                                  type="text"
                                  placeholder="email"
                                  value={this.state.Email}
                                  disabled={true}
                                />
                              </FormGroup>
                            </Col>

                            <Col md={12}>
                              <FormGroup>
                                <label htmlFor="payment">Confirmado?</label>
                                <FormInput
                                  id="payment"
                                  type="text"
                                  placeholder=""
                                  value={
                                    this.state.payment === false ? "Não" : "Sim"
                                  }
                                  disabled={true}
                                />
                              </FormGroup>
                            </Col>

                            <Col md={12} style={{ textAlign: "center" }}>
                              <Button
                                style={{
                                  background: "#34b4eb",
                                  color: "#fff",
                                  width: "200px",
                                  textAlign: "center",
                                }}
                                disabled={
                                  this.state.payment === false ? false : true
                                }
                              >
                                {"Confirmo que efetuei o pagamento da 1ª quota"}
                              </Button>
                            </Col>
                            <Col md={12} style={{ textAlign: "center" }}>
                              <Button
                                style={{
                                  background: "#34b4eb",
                                  color: "#fff",
                                  width: "200px",
                                  textAlign: "center",
                                }}
                                onClick={this.LoginReturn}
                              >
                                {"Regressar à Página de Login"}
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-black opacity-8 mt-3">
                    Copyright &copy;
                  </div>
                  {this.state.refresh}
                </Col>
              </div>
            </div>
          </BlockUi>
        </Fragment>
      );
    }
  }
}

export default Payment_Page;

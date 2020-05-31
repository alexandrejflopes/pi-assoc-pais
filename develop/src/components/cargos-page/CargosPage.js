import React, { Component, Fragment } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardHeader,
  CardBody,
  FormInput,
} from "shards-react";
import ConfirmationDialog from "../../components/dialog/ConfirmationDialog";
import { toast, Bounce } from "react-toastify";
import { Link, Redirect } from "react-router-dom";
import { aceitarCargoPrompt } from "../../utils/common_strings";
import {
  sucessoGeral,
  erroUpdateCargos,
  confirmAceitarCargo,
} from "../../utils/messages_strings";
import { languageCode, showToast, toastTypes } from "../../utils/general_utils";

import {
  firestore,
  firebase_auth,
  firebase,
  firebaseConfig,
} from "../../firebase-config";
import PageTitle from "../common/PageTitle";
import CargosModal from "./CargosModal";

class Cargos_Page extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: null,
      transitions: [],
      email: "",
      cargoIdAceitar: "",
      dialogOpen: false,

      blocking: false,
      errors: {},
      nome: null,
      admin: null,
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.getTransitions = this.getTransitions.bind(this);
    this.aceitarSelectedCargo = this.aceitarSelectedCargo.bind(this);
    this.openAceitarCargoDialog = this.openAceitarCargoDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
  }

  componentDidMount() {
    const this_ = this;
    var currentUser = JSON.parse(window.localStorage.getItem("userDoc"));
    if (currentUser != null) {
      this.setState({ email: currentUser.Email });
      this_.getTransitions();
    } else {
      //Redirect to login
      var redirect = (
        <Redirect
          to={{
            pathname: "/",
          }}
        />
      );
      this.setState({ redirect: redirect });
    }
  }

  getTransitions() {
    const this_ = this;
    const project_id = firebaseConfig.projectId;

    let uri =
      "https://us-central1-" +
      project_id +
      ".cloudfunctions.net/api/getCargoTransitions";

    const request = async () => {
      await fetch(uri)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
          this_.setState({ transitions: data });
        })
        .catch(function (error) {});
    };

    request();

    /* 
    //Get student parameters from database
    const collection = firestore.collection("cargoTransition");
    collection
      .get()
      .then((col) => {
        var transitions = [];
        if (col.docs && col.docs.length > 0) {
          var docs = col.docs;
          for (var i = 0; i < docs.length; i++) {
            var dados = docs[i].data();
            dados["idDoc"] = docs[i].id;
            transitions.push(dados);
          }
          this_.setState({ transitions: transitions });
        }
      })
      .catch((err) => {
        alert(err);
      });
      */
  }

  openAceitarCargoDialog(e) {
    const id = e.target.id;

    this.setState({ cargoIdAceitar: id });
    this.setState({ dialogOpen: true });
  }

  closeDialog() {
    this.setState({ dialogOpen: false });
  }

  aceitarSelectedCargo(confirmation) {
    const { cargoIdAceitar } = this.state;
    const this_ = this;
    const project_id = firebaseConfig.projectId;
    this_.closeDialog();

    if (confirmation) {
      let uri =
        "https://us-central1-" +
        project_id +
        ".cloudfunctions.net/api/executeCargoTransition?id=" +
        cargoIdAceitar;

      const request = async () => {
        await fetch(uri)
          .then(function (data) {
            //console.log(data);
            this_.setState({ cargoIdAceitar: "" }, () =>
              this_.getTransitions()
            );
            showToast(sucessoGeral[languageCode], 5000, toastTypes.SUCCESS);
          })
          .catch(function (error) {
            showToast(erroUpdateCargos[languageCode], 5000, toastTypes.ERROR);
          });
      };

      request();
    }
  }

  render() {
    return (
      <div>
        <Row style={{ margin: "10px" }}>
          <CargosModal getTransitions={this.getTransitions} />
        </Row>
        <Row>
          <Container fluid className="main-content-container px-4">
            {/* Default Light Table */}
            <Row>
              <Col>
                <Card small>
                  <CardHeader className="border-bottom">
                    <h6 className="m-0">Transições de Cargos</h6>
                  </CardHeader>
                  <CardBody>
                    <table
                      className="table table-striped"
                      style={{
                        display: "block",
                        overflow: "auto",
                        whitespace: "nowrap",
                      }}
                    >
                      <thead className="bg-light">
                        <tr>
                          <th scope="col" className="border-0">
                            Nome
                          </th>
                          <th scope="col" className="border-0">
                            Email
                          </th>
                          <th scope="col" className="border-0">
                            Novo Cargo
                          </th>
                          <th scope="col" className="border-0">
                            Aceite?
                          </th>
                          <th scope="col" className="border-0">
                            Data
                          </th>
                          <th scope="col" className="border-0">
                            Aceitar
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.transitions.map((membro, idx) => (
                          <tr>
                            <td> {membro.nome ? membro.nome : "-"}</td>
                            <td> {membro.email ? membro.email : "-"}</td>
                            <td> {membro.cargo ? membro.cargo : "-"}</td>
                            <td> {membro.aceite == true ? "Sim" : "Não"}</td>
                            <td> {membro.data ? membro.data : "-"}</td>
                            <td>
                              {" "}
                              {membro.aceite == true ? (
                                <Button disabled={true}> Aceitar </Button>
                              ) : (
                                <Button
                                  disabled={!(membro.email == this.state.email)}
                                  id={membro.id}
                                  onClick={this.openAceitarCargoDialog}
                                >
                                  {" "}
                                  Aceitar{" "}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {this.state.redirect}
            {this.state.dialogOpen ? (
              <ConfirmationDialog
                open={this.state.dialogOpen}
                result={this.aceitarSelectedCargo}
                title={aceitarCargoPrompt[languageCode]}
                message={confirmAceitarCargo[languageCode]}
              />
            ) : null}
          </Container>
        </Row>
      </div>
    );
  }
}
export default Cargos_Page;

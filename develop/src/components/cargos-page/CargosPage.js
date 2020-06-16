import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardHeader,
  CardBody,
} from "shards-react";
import ConfirmationDialog from "../../components/dialog/ConfirmationDialog";
import { Redirect } from "react-router-dom";
import {aceitarCargoPrompt, loading} from "../../utils/common_strings";
import {
  sucessoGeral,
  erroUpdateCargos,
  confirmAceitarCargo, semTransicoesDeCargos,
} from "../../utils/messages_strings";
import {
  cargoDocKey,
  languageCode,
  parentsParameters,
  showToast,
  toastTypes
} from "../../utils/general_utils";

import {
  firebaseConfig
} from "../../firebase-config";
import CargosModal from "./CargosModal";
import {userLogOut} from "../../firebase_scripts/profile_functions";
import {Table} from "react-bootstrap";

class Cargos_Page extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: null,
      transitions: null, // array
      email: "",
      cargoIdAceitar: "",
      dialogOpen: false,

      blocking: false,
      errors: {},
      nome: null,
      admin: null,
      cargosCollection: {},
      permissionChanged : false,
      newCargo : "",
      numAdminRoles : -1
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

    const project_id = firebaseConfig.projectId;

    let uri =
      "https://us-central1-" +
      project_id +
      ".cloudfunctions.net/api/getCargos";

    const request = async () => {
      await fetch(uri)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
          let cargosJSON = {};
          let numberAdminRoles = 0;
          for(let i in data){
            cargosJSON[data[i][cargoDocKey]] = data[i].admin;
            if(data[i].admin){
              numberAdminRoles+=1;
            }
          }
          console.log("cargosJSON -> " + JSON.stringify(cargosJSON));
          this_.setState({cargosCollection : cargosJSON, numberAdminRoles:numberAdminRoles});
        })
        .catch(function (error) {});
    };

    request();


    //---------------------------------------------------------

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

  }

  openAceitarCargoDialog(e) {
    console.log("cargosCollection");
    console.log(this.state.cargosCollection);
    const id = e.target.id;
    const newCargo = e.target.value;
    this.setState({newCargo : newCargo});
    const newCargoAdmin = this.state.cargosCollection[newCargo];
    const currentUserAdmin = (JSON.parse(window.localStorage.getItem("userDoc")))[parentsParameters.ADMIN[languageCode]];

    if(newCargoAdmin !== currentUserAdmin){
      this.setState({permissionChanged : true});
    }
    else{
      this.setState({permissionChanged : false});
    }

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
            if(this_.state.permissionChanged){
              userLogOut(); // logout if user permission changed in order to not having denied access
            }
            else{
              let currentUser = JSON.parse(window.localStorage.getItem("userDoc"));
              currentUser[parentsParameters.ROLE[languageCode]] = this_.state.newCargo;
              window.localStorage.setItem("userDoc", JSON.stringify(currentUser));
              this_.setState({newCargo : ""}); // reset newCargo variable
            }
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
          <CargosModal getTransitions={this.getTransitions} cargosCollection={this.state.cargosCollection} numberAdminRoles={this.state.numberAdminRoles} />
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
                  {this.state.transitions==null ? <CardBody>{loading[languageCode]}</CardBody> :
                    <CardBody className="p-0 pb-3">
                    <Table
                    className="table mb-0"
                    responsive
                    striped
                    >
                      {this.state.transitions.length === 0 ? semTransicoesDeCargos[languageCode] :
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
                        </thead>}
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
                              value={membro.cargo}
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
                    </Table>
                    </CardBody>}
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

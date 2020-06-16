/* eslint jsx-a11y/anchor-is-valid: 0 */

import React, { Fragment, useState } from "react";
import ReactDOM from "react-dom";
import Modal from "react-bootstrap/Modal";
import { Redirect } from "react-router";
import {
  ListGroup,
  ListGroupItem,
  Button,
  Col,
  Form,
  FormGroup,
  FormInput,
  FormFeedback,
  FormTextarea,
  FormCheckbox, FormSelect,
} from "shards-react";
import {
  languageCode,
  parentsParameters,
  showToast,
  toastTypes,
  saveButton,
  closeButton,
  newCargoTransactionButton,
  newCargosTitle,
  newCargosHeaderName,
  newCargosHeaderEmail,
  newCargosHeaderCargoAtual,
  newCargosHeaderNovoCargo,
  cargosSemCargo,
  cargosSemMudanca,
} from "../../utils/general_utils";
import * as moment from "moment";
import { Multiselect } from "multiselect-react-dropdown";
import {
  addCasoError,
  sucessoGeral,
  cargosGetError,
  cargosNothingToUpdateWarning,
  cargosUpdateError, erroCargosRepetidos, loadingInfo, erroCargosAdminEmFalta,
} from "../../utils/messages_strings";
import {
  firestore,
  firebase_auth,
  firebase,
  firebaseConfig,
} from "../../firebase-config";
import { toast, Bounce } from "react-toastify";
import { saveCaseToDB } from "../../firebase_scripts/installation";
import {loading} from "../../utils/common_strings";

class CargosModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      admin: false,
      redirect: null,
      listaCargos: [],
      cargosAtuais: {},
      changes: {},

      membersComplete: [],
      membrosSelected: [],
      options: [],
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.createTransaction = this.createTransaction.bind(this);
    this.change = this.change.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.loadParents = this.loadParents.bind(this);

    this.loadParents();
  }

  componentDidMount() {
    let currentUser = JSON.parse(window.localStorage.getItem("userDoc"));
    if (currentUser != null) {
      let admin_ = currentUser.Admin;
      this.setState({ admin: admin_ });
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

  loadParents() {
    const parentsCollection = firestore.collection("parents");

    parentsCollection.get().then((querySnapshot) => {
      var membersArray = [];
      var membersArrayComplete = [];
      var options = [];

      var index = 0;
      querySnapshot.forEach((doc) => {
        if (doc.data()["Nome"] != undefined && doc.data()["Nome"] != null) {
          if (
            doc.data()["Validated"] != undefined &&
            doc.data()["Validated"] != null &&
            doc.data()["Validated"].toString() != "false"
          ) {
            membersArrayComplete.push({
              nome: doc.data()["Nome"],
              id: doc.data()["Email"],
              photo: doc.data()["photo"],
            });
            options.push({ id: index, name: doc.data()["Nome"] });
            index += 1;
          }
        }
      });
      if (options.length != 0) {
        //console.log(membersArrayComplete);
        this.setState({
          membersComplete: membersArrayComplete,
          options: options,
        });
      }
    });
  }

  showModal() {
    const project_id = firebaseConfig.projectId;
    const this_ = this;

    let uri =
      "https://us-central1-" +
      project_id +
      ".cloudfunctions.net/api/getUserCargos";

    showToast(
      loading[languageCode],
      2000,
      toastTypes.INFO
    );

    const request = async () => {
      await fetch(uri)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
          let cargosList = [];
          let currentCargosList = {};
          let cargos = data.cargos;
          let users = data.users;

          cargosList.push(cargosSemMudanca[languageCode]);
          for (let i = 0; i < cargos.length; i++) {
            cargosList.push(cargos[i]);
          }
          for (let x = 0; x < users.length; x++) {
            let json = users[x];
            currentCargosList[json.id] = json.Cargo;
          }

          this_.setState({
            listaCargos: cargosList,
            cargosAtuais: currentCargosList,
            show: true,
          });
        })
        .catch(function (error) {
          showToast(cargosGetError[languageCode], 5000, toastTypes.ERROR);
        });
    };

    request();
  }

  closeModal() {
    this.setState({
      show: false,
      membrosSelected: [],
    });
  }

  change(event) {
    var index = event.target.id;
    var changes = this.state.changes;

    changes[index] = event.target.value;
    this.setState({ changes: changes });
  }

  createTransaction() {
    const { changes, membersComplete, cargosAtuais } = this.state;
    const this_ = this;
    const project_id = firebaseConfig.projectId;

    var tamanho = Object.keys(changes).length;
    var keys = Object.keys(changes);

    if (tamanho === 0) {
      showToast(
        cargosNothingToUpdateWarning[languageCode],
        5000,
        toastTypes.WARNING
      );
    } else {
      var mudanca = false;
      var listaMembros = [];
      var data_ = new Date();
      var data = moment(data_).format("DD-MM-YYYY").toString();

      for (var i = 0; i < tamanho; i++) {
        if (
          changes[keys[i]] !== cargosSemMudanca[languageCode] &&
          changes[keys[i]] !== cargosAtuais[membersComplete[keys[i]].id]
        ) {
          mudanca = true;
          listaMembros.push({
            nome: membersComplete[keys[i]].nome,
            id: membersComplete[keys[i]].id,
            cargo: changes[keys[i]],
            data: data,
          });
        }
      }

      if (mudanca) {

        /*
        * FLUXO:
        *   - buscar o userAndCurrentCargos
        *   - modificar (cópia) as linhas correspondentes à lista de membros
        *   - percorrer a cópia e ver se há cargos admin repetidos
        *       - se sim, mensagem a informar e impedir a operação
        * */

        console.log("cargosCollection v");
        console.log(this.props.cargosCollection);

        let usersAndNewCargos = {...this_.state.cargosAtuais};

        // update local copy to reflect new roles
        for(let i in listaMembros){
          let membroJson = listaMembros[i];
          const id = membroJson.id;
          usersAndNewCargos[id] = membroJson.cargo;
        }

        console.log("usersAndNewCargos v");
        console.log(usersAndNewCargos);

        let cargosAnalyzed = [];
        let cargosRepetidos = false;
        let numCorretoCargosAdmin = true;

        for(let k in usersAndNewCargos){
          const cargo = usersAndNewCargos[k];
          // if it's admin role
          if(this.props.cargosCollection[cargo]){
            if(cargosAnalyzed.includes(cargo)){
              cargosRepetidos = true;
              break;
            }
            cargosAnalyzed.push(cargo);
          }
        }

        //cargosAnalyzed should contain every admin role once and only once
        if(cargosAnalyzed.length!==this_.props.numberAdminRoles){
          numCorretoCargosAdmin = false;
        }


        console.log("cargosAnalyzed -> " + cargosAnalyzed.toString());

        if(cargosRepetidos){
          showToast(
            erroCargosRepetidos[languageCode],
            5000,
            toastTypes.WARNING
          );
        }else if(!numCorretoCargosAdmin){
          showToast(
            erroCargosAdminEmFalta[languageCode],
            5000,
            toastTypes.WARNING
          );
        }else{
          let uri =
            "https://us-central1-" +
            project_id +
            ".cloudfunctions.net/api/sendCargoChangeEmail?" +
            "membros=" +
            encodeURIComponent(JSON.stringify(listaMembros));

          const request = async () => {
            await fetch(uri)
              .then(function (data) {
                showToast(sucessoGeral[languageCode], 5000, toastTypes.SUCCESS);

                this_.props.getTransitions();
                this_.closeModal();
              })
              .catch(function (error) {
                showToast(
                  cargosUpdateError[languageCode],
                  5000,
                  toastTypes.ERROR
                );
              });
          };
          request();
        }


      } else {
        showToast(
          cargosNothingToUpdateWarning[languageCode],
          5000,
          toastTypes.WARNING
        );
      }
    }
  }

  render() {
    return (
      <>
        {this.state.admin ? (
          <Button
            size="md"
            theme="success"
            id="new_case"
            onClick={this.showModal}
          >
            <i className="fa fa-plus mr-1" />{" "}
            {newCargoTransactionButton[languageCode]}
          </Button>
        ) : (
          ""
        )}
        {this.state.redirect}

        <Modal size="lg" show={this.state.show} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>{newCargosTitle[languageCode]}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup flush>
              <ListGroupItem className="p-3">
                <Col>
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
                          {newCargosHeaderName[languageCode]}
                        </th>
                        <th scope="col" className="border-0">
                          {newCargosHeaderEmail[languageCode]}
                        </th>
                        <th scope="col" className="border-0">
                          {newCargosHeaderCargoAtual[languageCode]}
                        </th>
                        <th scope="col" className="border-0">
                          {newCargosHeaderNovoCargo[languageCode]}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.membersComplete.map((membro, idx) => (
                        <tr>
                          <td>{membro.nome}</td>

                          <td>{membro.id}</td>
                          <td>
                            {this.state.cargosAtuais[membro.id]
                              ? this.state.cargosAtuais[membro.id]
                              : "-"}
                          </td>
                          <td>
                            <FormSelect
                              name="cargos"
                              id={idx}
                              onChange={this.change}
                            >
                              {this.state.listaCargos.map((cargo, index) => (
                                <option value={cargo}>{cargo}</option>
                              ))}
                            </FormSelect >
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Col>
              </ListGroupItem>
            </ListGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button theme="danger" onClick={this.closeModal}>
              {closeButton[languageCode]}
            </Button>
            <Button theme="success" onClick={this.createTransaction}>
              {saveButton[languageCode]}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default CargosModal;

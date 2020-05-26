/* eslint jsx-a11y/anchor-is-valid: 0 */

import React, { Fragment, useState } from "react";
import ReactDOM from "react-dom";
import Modal from "react-bootstrap/Modal";
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
  FormCheckbox,
} from "shards-react";
import {
  languageCode,
  parentsParameters,
  showToast,
  toastTypes,
  saveButton,
  closeButton,
  newCaseButton,
} from "../../utils/general_utils";
import { Multiselect } from "multiselect-react-dropdown";
import { addCasoError, sucessoGeral } from "../../utils/messages_strings";
import { firestore, firebase_auth, firebase } from "../../firebase-config";
import { toast, Bounce } from "react-toastify";
import { saveCaseToDB } from "../../firebase_scripts/installation";

class CasosModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      membersComplete: [],
      membrosSelected: [],
      options: [],
      show: false,
      checkBoxStatus: false,
      caseTitle: "",
      descricao: "",
    };

    this.createCase = this.createCase.bind(this);
    this.handleChangeDescricao = this.handleChangeDescricao.bind(this);
    this.handleChangeCaseTitle = this.handleChangeCaseTitle.bind(this);
    this.handleChangeCheckBox = this.handleChangeCheckBox.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.loadParents = this.loadParents.bind(this);
    this.handleChangeCheckBoxMembers = this.handleChangeCheckBoxMembers.bind(
      this
    );
    this.onSelectMembro = this.onSelectMembro.bind(this);
    this.onRemoveMembro = this.onRemoveMembro.bind(this);
    this.loadParents();
  }

  handleChangeCheckBoxMembers(e) {
    const id = e.target.id;

    var array = this.state.membersCheckBoxStatus;
    var prev = array[id];
    var newVal;
    if (prev) {
      newVal = false;
    } else {
      newVal = true;
    }

    array[id] = newVal;
    this.setState({ membersCheckBoxStatus: array });
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
        this.setState({
          membersComplete: membersArrayComplete,
          options: options,
        });
      }
    });
  }

  showModal() {
    this.setState({ show: true });
  }

  closeModal() {
    this.setState({
      show: false,
      caseTitle: "",
      descricao: "",
      membrosSelected: [],
      checkBoxStatus: false,
    });
  }

  handleChangeCheckBox() {
    let { checkBoxStatus } = this.state;
    var newValue = false;
    if (checkBoxStatus) {
      newValue = false;
    } else {
      newValue = true;
    }

    this.setState({ checkBoxStatus: newValue });
  }

  handleChangeCaseTitle(e) {
    this.setState({ caseTitle: e.target.value });
  }

  handleChangeDescricao(e) {
    this.setState({ descricao: e.target.value });
  }

  onSelectMembro(selectedList, selectedItem) {
    var array = this.state.membrosSelected;
    array.push(selectedItem.id);
    this.setState({ membrosSelected: array });
  }

  onRemoveMembro(selectedList, removedItem) {
    const { membrosSelected } = this.state;
    var array = membrosSelected;

    var index = array.indexOf(removedItem.id);
    if (index !== -1) {
      array.splice(index, 1);
    }

    this.setState({ membrosSelected: array });
  }

  createCase() {
    const {
      checkBoxStatus,
      caseTitle,
      descricao,
      membersComplete,
      membrosSelected,
    } = this.state;
    const this_ = this;

    var currentUser = JSON.parse(window.localStorage.getItem("userDoc"));

    if (caseTitle === "") {
      var message = "Título do caso em falta!";
      toast.configure();
      toast(message, {
        transition: Bounce,
        closeButton: true,
        autoClose: 2000,
        position: "top-right",
        type: "error",
      });
    } else {
      var listaMembros = [];
      var privateVal = false;

      if (checkBoxStatus) {
        privateVal = true;

        var listaCompletaMembros = membersComplete;

        for (var i = 0; i < membrosSelected.length; i++) {
          listaMembros.push(listaCompletaMembros[membrosSelected[i]]);
        }
      }

      let uri =
        "https://us-central1-associacao-pais.cloudfunctions.net/api/addCaso?" +
        "titulo=" +
        encodeURIComponent(caseTitle) +
        "&" +
        "descricao=" +
        encodeURIComponent(descricao) +
        "&" +
        "membros=" +
        encodeURIComponent(JSON.stringify(listaMembros)) +
        "&" +
        "privado=" +
        privateVal +
        "&" +
        "nome_autor=" +
        encodeURIComponent(currentUser.Nome) +
        "&" +
        "id_autor=" +
        currentUser.Email +
        "&" +
        "foto_autor=" +
        currentUser.photo;

      const request = async () => {
        await fetch(uri)
          .then(function (data) {
            console.log("Caso adicionado com sucesso.");
            showToast(sucessoGeral[languageCode], 5000, toastTypes.SUCCESS);

            this_.setState({ caseTitle: "", descricao: "" });
            this_.closeModal();
            this_.props.componentDidMount();
          })
          .catch(function (error) {
            console.log(error);
            showToast(addCasoError[languageCode], 5000, toastTypes.ERROR);
          });
      };

      request();
    }
  }

  render() {
    return (
      <>
        <Button
          size="md"
          theme="success"
          id="new_case"
          onClick={this.showModal}
        >
          <i className="fa fa-plus mr-1" /> {newCaseButton[languageCode]}
        </Button>

        <Modal show={this.state.show} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Novo caso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup flush>
              <ListGroupItem className="p-3">
                <Col>
                  <Form>
                    <FormGroup>
                      <label htmlFor="configAssocName">Título do caso</label>
                      <FormInput
                        id="novoCasoTitulo"
                        type="text"
                        placeholder="Breve título do situação que origina o caso."
                        value={this.state.caseTitle}
                        onChange={this.handleChangeCaseTitle}
                        required
                      />
                      <FormFeedback
                        id="novoCasoTituloFeedback"
                        valid={false}
                        style={{ display: "none" }}
                      >
                        Por favor, preencha este campo
                      </FormFeedback>
                    </FormGroup>

                    {/* Descricao Textarea */}
                    <FormGroup>
                      <label htmlFor="novoCasoDescricao">
                        Descrição (opcional)
                      </label>
                      <FormTextarea
                        id="novoCasoDescricao"
                        placeholder="Descrição breve da situação que origina o caso."
                        value={this.state.descricao}
                        onChange={this.handleChangeDescricao}
                      />
                      <FormFeedback
                        id="novoCasoDescricaoFeedback"
                        valid={false}
                        style={{ display: "none" }}
                      >
                        Por favor, preencha este campo
                      </FormFeedback>
                    </FormGroup>

                    <FormGroup>
                      <FormCheckbox
                        id="novoCasoPrivadoCheckbox"
                        checked={this.state.checkBoxStatus}
                        onChange={this.handleChangeCheckBox}
                      >
                        {/* eslint-disable-next-line */}Este caso é privado.
                      </FormCheckbox>
                    </FormGroup>

                    {this.state.checkBoxStatus ? (
                      <FormGroup>
                        <label htmlFor="membros">Membros</label>
                        <Multiselect
                          options={this.state.options} // Options to display in the dropdown
                          onSelect={this.onSelectMembro} // Function will trigger on select event
                          onRemove={this.onRemoveMembro}
                          displayValue="name" // Property name to display in the dropdown options
                          showCheckbox={true}
                        />
                      </FormGroup>
                    ) : (
                      ""
                    )}
                  </Form>
                </Col>
              </ListGroupItem>
            </ListGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button theme="danger" onClick={this.closeModal}>
              {closeButton[languageCode]}
            </Button>
            <Button theme="success" onClick={this.createCase}>
              {saveButton[languageCode]}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default CasosModal;

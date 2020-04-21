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
import { firestore, firebase_auth, firebase } from "../../firebase-config";
import { toast, Bounce } from "react-toastify";
import { saveCaseToDB } from "../../firebase_scripts/installation";

class CasosModal extends React.Component {
  constructor(props) {
    super(props);
    console.log("props: " + props);

    this.state = {
      members: [],
      membersComponent: null,
      membersCheckBoxStatus: null,
      membrosList: [
        <Fragment>
          <FormGroup>
            <label htmlFor="novoCasoMembroEmail1">Email</label>
            <FormInput
              id="novoCasoMembroEmail1"
              type="email"
              placeholder="socio@exemplo.pt"
              required
            />
          </FormGroup>
        </Fragment>,
      ],
      numMembros: 1,
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
      querySnapshot.forEach((doc) => {
        if (doc.data()["Nome"] != undefined && doc.data()["Nome"] != null) {
          membersArray.push(doc.data()["Nome"]);
        }
      });
      if (membersArray.length != 0) {
        var listCheckBoxesMembers = [];
        var membersCheckBoxStatus = {};
        for (var x = 0; x < membersArray.length; x++) {
          var member = membersArray[x];
          var idx = member.trim() + "CheckBox";
          membersCheckBoxStatus[idx] = false;
        }
        this.setState({
          membersCheckBoxStatus: membersCheckBoxStatus,
        });

        for (var i = 0; i < membersArray.length; i++) {
          if (i == 0 || i % 2 == 0) {
          }
          var member = membersArray[i];
          var idx = member.trim() + "CheckBox";
          var checkBox = (
            <FormGroup>
              <FormCheckbox
                id={idx}
                onChange={this.handleChangeCheckBoxMembers}
                isChecked={this.state.membersCheckBoxStatus[idx]}
              >
                {member}
              </FormCheckbox>
            </FormGroup>
          );
          listCheckBoxesMembers.push(checkBox);
        }

        this.setState({
          members: membersArray,
          membersComponent: listCheckBoxesMembers,
        });
      }
    });
  }

  showModal() {
    this.setState({ show: true });
  }

  closeModal() {
    this.setState({ show: false });
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

  createCase() {
    const { checkBoxStatus, caseTitle, descricao } = this.state;

    console.log(caseTitle);
    if (caseTitle == "") {
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
      }

      var date = new Date().getTime();

      var json = {};
      var autor = {};
      autor["nome"] = "por fazer";
      autor["id"] = "por fazer";
      json["autor"] = autor;
      json["data_criacao"] = date;
      json["membros"] = listaMembros;
      json["observacoes"] = [];
      json["ficheiros"] = [];
      json["privado"] = privateVal;
      json["titulo"] = caseTitle;
      json["descricao"] = descricao;
      json["arquivado"] = false;

      saveCaseToDB(json);
      this.setState({ caseTitle: "", descricao: "" });
      this.closeModal();
      this.props.componentDidMount();
    }
  }

  render() {
    //console.log("state a render -> " + JSON.stringify(this.state));
    return (
      <>
        <Button
          size="md"
          theme="primary"
          id="new_case"
          onClick={this.showModal}
        >
          <i className="fa fa-plus mr-1" /> Abrir um novo caso
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
                      <label htmlFor="configAssocName">Título de caso</label>
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

                    {this.state.checkBoxStatus
                      ? this.state.membersComponent
                      : ""}
                  </Form>
                </Col>
              </ListGroupItem>
            </ListGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>
              Fechar
            </Button>
            <Button variant="primary" onClick={this.createCase}>
              Criar caso
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default CasosModal;

/* eslint jsx-a11y/anchor-is-valid: 0 */

import React, { Fragment, useState } from "react";
import ReactDOM from "react-dom";
import Modal from "react-bootstrap/Modal";
import {
  ListGroup,
  ListGroupItem,
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  FormInput,
  FormFeedback,
  FormTextarea,
  FormCheckbox,
} from "shards-react";
import {
  firestore,
  firebase_auth,
  firebase,
  firebaseConfig,
} from "../../firebase-config";
import { toast, Bounce } from "react-toastify";
import { saveCaseToDB } from "../../firebase_scripts/installation";

class ApprovalModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dados: this.props.dados,
      parentComponent: this.props.parentComponent,
      extraParent: null,
      moreStudents: null,
    };

    this.approve = this.approve.bind(this);
    this.refuse = this.refuse.bind(this);
    this.loadExtraParent = this.loadExtraParent.bind(this);
    this.addStudent = this.addStudent.bind(this);

    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.loadExtraParent();

    this.addStudent();
  }

  addStudent() {
    var { moreStudents } = this.state;

    var this_ = this;

    var dadosFinaisAluno = null;
    var dicionarioAlunos = {};

    const project_id = firebaseConfig.projectId;
    //Get student parameters from database
    let uri =
      "https://us-central1-" +
      project_id +
      ".cloudfunctions.net/api/getAllNewParams";
    const request = async () => {
      let resposta;
      await fetch(uri)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
          var dataDoc = data;
          if (data === undefined || data.error) {
            console.log("doc não existe");
          } else {
            const studentData = data["aluno"];
            if (studentData !== undefined) {
              var keys = Object.keys(studentData);

              var dadosAluno = [];
              for (var i = 0; i < keys.length; i++) {
                for (
                  var index = 0;
                  index < this_.state.dados.Educandos.length;
                  index++
                ) {
                  var valS = keys[i];

                  var idS = valS + "-" + i; //Id now contains a unique number to identify it
                  var value = this_.state.dados.Educandos[index];

                  //Object to render
                  var dado = (
                    <FormGroup>
                      <label htmlFor={idS}>{valS}</label>
                      <FormInput
                        id={idS}
                        placeholder={valS}
                        value={value[valS]}
                        disabled={true}
                      />
                    </FormGroup>
                  );

                  if (i == 0) {
                    dicionarioAlunos[index] = [dado];
                  } else {
                    var dados = dicionarioAlunos[index];
                    dados.push(dado);
                    dicionarioAlunos[index] = dados;
                  }

                  dadosAluno.push(dado);
                }
              }

              var finalArray = [];

              for (
                var index1 = 0;
                index1 < this_.state.dados.Educandos.length;
                index1++
              ) {
                var newName = "studentName-" + index1;
                var newYear = "studentYear-" + index1;

                var add = (
                  <Fragment>
                    <hr />
                    <FormGroup>
                      <label htmlFor="studentName">Nome Aluno</label>
                      <FormInput
                        id={newName}
                        type="text"
                        placeholder="Nome"
                        value={this_.state.dados.Educandos[index1]["Nome"]}
                        disabled={true}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label htmlFor="studentYear">Ano Escolaridade</label>
                      <FormInput
                        id={newYear}
                        type="text"
                        placeholder="5º"
                        value={this_.state.dados.Educandos[index1]["Ano"]}
                        disabled={true}
                      />
                    </FormGroup>
                    {dicionarioAlunos[index1]}
                  </Fragment>
                );
                finalArray.push([add]);
              }

              this_.setState({
                moreStudents: finalArray,
              });
            }
          }
        })
        .catch(function (error) {
          alert(error);
        });
      return resposta;
    };

    var dados = request();
  }

  loadExtraParent() {
    var { extraParent } = this.state;
    var this_ = this;

    var dadosFinaisPai = null;

    const project_id = firebaseConfig.projectId;

    let uri =
      "https://us-central1-" +
      project_id +
      ".cloudfunctions.net/api/getAllNewParams";
    const request = async () => {
      let resposta;
      await fetch(uri)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
          var dataDoc = data;
          if (data === undefined || data.error) {
            console.log("doc não existe");
          } else {
            const eeData = data["EE"]; // Get parent dictionary of extra parameters
            if (eeData !== undefined) {
              var keys = Object.keys(eeData);

              var extraPai = 0; // Counts number of extra parameters that belong to the parent part of the registry

              var dadosPai = []; // Will store all objects to render from the parent side
              for (var i = 0; i < keys.length; i++) {
                extraPai++;
                var val = keys[i]; // Actual name of parameter

                // Objects to render
                var dado = (
                  <FormGroup>
                    <label htmlFor={val}>{val}</label>
                    <FormInput
                      id={val}
                      placeholder={val}
                      value={this_.state.dados[val]}
                      disabled={true}
                    />
                  </FormGroup>
                );
                dadosPai.push(dado); //Add object to array
              }
              dadosFinaisPai = dadosPai;
            }

            // Save data to state
            this_.setState({
              extraParent: dadosFinaisPai,
            });
          }
        })
        .catch(function (error) {
          alert(error);
        });
      return resposta;
    };

    var dados = request();
  }

  approve() {
    const { dados } = this.state;
    const this_ = this;
    // TODO: gerar numero de sócio aleatoriamente
    firestore
      .collection("parents")
      .doc(dados.Email)
      .set(
        {
          Validated: true,
          "Data inscricao": new Date().toJSON().split("T")[0], // obter data no formato 2015-03-25;
        },
        { merge: true }
      )
      .then(function () {
        console.log("Document successfully updated!");
        this_.closeModal();
        this_.state.parentComponent.reload();

        const project_id = firebaseConfig.projectId;
        let uri =
          "https://us-central1-" +
          project_id +
          ".cloudfunctions.net/api/sendApprovedEmail?" +
          "email=" +
          dados.Email +
          "&" +
          "nome=" +
          dados.Nome;
        const request = async () => {
          let resposta;
          await fetch(uri)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function (data) {
              resposta = data;
            })
            .catch(function (error) {
              console.log(error);
            });

          return resposta;
        };

        return request();
      })
      .catch(function (error) {
        alert("Error removing document: " + error);
      });
  }

  refuse() {
    const { dados } = this.state;
    const this_ = this;

    const project_id = firebaseConfig.projectId;

    firestore
      .collection("parents")
      .doc(dados.Email)
      .delete()
      .then(function () {
        this_.closeModal();
        this_.state.parentComponent.reload();
        let uri =
          "https://us-central1-" +
          project_id +
          ".cloudfunctions.net/api/sendRejectedEmail?" +
          "email=" +
          dados.Email +
          "&" +
          "nome=" +
          dados.Nome;
        const request = async () => {
          let resposta;
          await fetch(uri)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function (data) {
              resposta = data;
            })
            .catch(function (error) {
              console.log(error);
            });

          return resposta;
        };

        return request();
      })
      .catch(function (error) {
        alert("Error removing document: " + error);
      });
  }

  showModal() {
    this.setState({ show: true });
  }

  closeModal() {
    this.setState({ show: false });
  }

  render() {
    return (
      <>
        <Button
          size="md"
          theme="primary"
          id="new_case"
          onClick={this.showModal}
        >
          <i className="fa fa-plus mr-1" /> Ver Detalhes
        </Button>

        <Modal show={this.state.show} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Registo Por Aprovar</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup flush>
              <ListGroupItem className="p-3">
                <Col>
                  <Form>
                    <FormGroup>
                      <label htmlFor="parentName">Nome</label>
                      <FormInput
                        id="parentName"
                        type="text"
                        placeholder="Nome"
                        value={this.state.dados.Nome}
                        disabled={true}
                      />
                    </FormGroup>
                    {this.state.dados.Emprego ? (
                      <FormGroup>
                        <label htmlFor="job">Profissão</label>
                        <FormInput
                          id="job"
                          placeholder="Profissão"
                          value={this.state.dados.Emprego}
                          disabled={true}
                        />
                      </FormGroup>
                    ) : (
                      ""
                    )}
                    <Row form>
                      <Col md="6" className="form-group">
                        <label htmlFor="localidade">Localidade</label>
                        <FormInput
                          id="localidade"
                          value={this.state.dados.Localidade}
                          disabled={true}
                        />
                      </Col>
                      <Col md="6" className="form-group">
                        <label htmlFor="zipCode">Código Postal</label>
                        <FormInput
                          id="zipCode"
                          value={this.state.dados["Código Postal"]}
                          disabled={true}
                        />
                      </Col>
                    </Row>
                    <Row form>
                      <Col md="6">
                        <label htmlFor="email">Email</label>
                        <FormInput
                          id="email"
                          type="email"
                          placeholder="nome@exemplo.pt"
                          value={this.state.dados.Email}
                          disabled={true}
                        />
                      </Col>
                      {this.state.dados.Telemóvel ? (
                        <Col md="6">
                          <FormGroup>
                            <label htmlFor="phone">Telemóvel / Telefone</label>
                            <FormInput
                              id="phone"
                              type="tel"
                              placeholder="200345678"
                              value={this.state.dados.Telemóvel}
                              disabled={true}
                            />
                          </FormGroup>
                        </Col>
                      ) : (
                        ""
                      )}
                    </Row>

                    {this.state.extraParent}

                    {this.state.moreStudents}
                  </Form>
                </Col>
              </ListGroupItem>
            </ListGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button theme="success" onClick={this.approve}>
              Aprovar
            </Button>
            <Button theme="danger" onClick={this.refuse}>
              Recusar
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default ApprovalModal;

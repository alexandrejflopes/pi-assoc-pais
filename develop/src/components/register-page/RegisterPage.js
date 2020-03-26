import React, { Component, Fragment } from "react";
import {
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Form,
  FormInput,
  FormGroup,
  FormCheckbox,
  Button,
  FormTextarea,
  FormFeedback
} from "shards-react";
import { Link } from "react-router-dom";
import AssocLogoUpload from "../config-inicial/AssocLogoUpload";
import MembersFileUpload from "../config-inicial/MembersFileUpload";
import NewParamsFileUpload from "../config-inicial/NewParamsFileUpload";
import { install } from "../../firebase_scripts/installation";
import StudentsFileUpload from "../config-inicial/StudentsFileUpload";
import { firestore, firebase_auth, firebase } from "../../firebase-config";

class Register_Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blocking: false,
      credentials: {
        email: "",
        password: ""
      },
      errors: {},
      extraParent: null,
      extraStudent: null,
      moreStudents: null,
      studentNumber: 0
    };

    this.renderExtra = this.renderExtra.bind(this);
    this.sendForm = this.sendForm.bind(this);
    this.addStudent = this.addStudent.bind(this);
    this.renderExtra();
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

    // const user = UsersService.getCurrentUser();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  sendForm() {
    console.log("Aqui fazer envio dados");
  }

  addStudent() {
    var { extraStudent, moreStudents, studentNumber } = this.state;

    var add = (
      <Fragment>
        <hr />
        <FormGroup>
          <label htmlFor="studentName">Nome Aluno</label>
          <FormInput id="studentName" type="text" placeholder="Nome" required />
          <FormFeedback
            id="studentNameFeedback"
            valid={false}
            style={{ display: "none" }}
          >
            Por favor, preencha este campo
          </FormFeedback>
        </FormGroup>

        {/* Descricao Textarea */}
        <FormGroup>
          <label htmlFor="studentYear">Ano Escolaridade</label>
          <FormInput id="studentYear" type="text" placeholder="5º" required />
          <FormFeedback
            id="studentYearFeedback"
            valid={false}
            style={{ display: "none" }}
          >
            Por favor, preencha este campo
          </FormFeedback>
        </FormGroup>
        {extraStudent}
      </Fragment>
    );

    studentNumber++;
    console.log("studentNumber: " + studentNumber);
    var toAdd = new Array(studentNumber).fill(add);

    this.setState({ moreStudents: toAdd, studentNumber: studentNumber });
  }

  renderExtra() {
    var { extraParent, extraStudent, moreStudents } = this.state;
    var this_ = this;

    console.log("Rendering extras...");
    var dadosFinaisPai = null;
    var dadosFinaisAluno = null;

    const extrasDoc = firestore.doc("initialConfigs/newParameters");
    extrasDoc
      .get()
      .then(doc => {
        if (doc.exists === true) {
          const dataDoc = doc.data();
          //console.log("dados extras: " + JSON.stringify(dataDoc));

          const eeData = dataDoc["EE"];
          if (eeData !== undefined) {
            var keys = Object.keys(eeData);
            //console.log("Keys extras pai: " + keys);

            var dadosPai = [];
            for (var i = 0; i < keys.length; i++) {
              var val = keys[i];
              var type = eeData[val];
              console.log("Valor-> " + val + ", " + type);

              if (type.includes("text")) {
                type = "text";
              } else if (type.includes("int")) {
                type = "number";
              }

              var dado = (
                <FormGroup>
                  <label htmlFor={val}>{val}</label>
                  <FormInput id={val} type={type} placeholder={val} />
                </FormGroup>
              );
              dadosPai.push(dado);
            }
            //console.log("1");
            dadosFinaisPai = dadosPai;
          }

          const studentData = dataDoc["aluno"];
          if (studentData !== undefined) {
            var keys = Object.keys(studentData);
            //console.log("Keys aluno: " + keys);

            var dadosAluno = [];
            for (var i = 0; i < keys.length; i++) {
              var val = keys[i];
              var type = studentData[val];
              var step = null;
              //console.log("Valor-> " + val + ", " + type);

              if (type.includes("text")) {
                type = "text";
              } else if (type.includes("int")) {
                type = "number";
                step = "1";
              } else if (type.includes("decimal")) {
                type = "number";
                step = "0.1";
              }

              var dado = (
                <FormGroup>
                  <label htmlFor={val}>{val}</label>
                  <FormInput
                    id={val}
                    type={type}
                    step={step}
                    placeholder={val}
                  />
                </FormGroup>
              );
              dadosAluno.push(dado);
            }

            dadosFinaisAluno = dadosAluno;
          }

          //console.log(dadosFinaisPai);
          this_.setState({
            extraParent: dadosFinaisPai,
            extraStudent: dadosFinaisAluno
          });
        } else {
          console.log("doc não existe");
        }
      })
      .catch(err => {
        alert(err);
      });

    console.log("Fim de rendering extras");
  }

  render() {
    return (
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
                  required
                />
                <FormFeedback
                  id="parentNameFeedback"
                  valid={false}
                  style={{ display: "none" }}
                >
                  Por favor, preencha este campo
                </FormFeedback>
              </FormGroup>

              {/* Descricao Textarea */}
              <FormGroup>
                <label htmlFor="nif">NIF</label>
                <FormInput id="nif" type="text" placeholder="NIF" required />
                <FormFeedback
                  id="nifFeedback"
                  valid={false}
                  style={{ display: "none" }}
                >
                  Por favor, preencha este campo
                </FormFeedback>
              </FormGroup>

              <FormGroup>
                <label htmlFor="job">Profissão (opcional)</label>
                <FormInput id="job" placeholder="Profissão" />
                <FormFeedback
                  id="jobFeedback"
                  valid={false}
                  style={{ display: "none" }}
                >
                  Por favor, preencha este campo
                </FormFeedback>
              </FormGroup>

              <Row form>
                <Col md="6" className="form-group">
                  <label htmlFor="localidade">Localidade</label>
                  <FormInput id="çocalidade" />
                  <FormFeedback
                    id="çocalidadeFeedback"
                    valid={false}
                    style={{ display: "none" }}
                  >
                    Por favor, preencha este campo
                  </FormFeedback>
                </Col>
                <Col md="6" className="form-group">
                  <label htmlFor="zipCode">Código Postal</label>
                  <FormInput id="zipCode" />
                  <FormFeedback
                    id="zipCodeFeedback"
                    valid={false}
                    style={{ display: "none" }}
                  >
                    Por favor, preencha este campo
                  </FormFeedback>
                </Col>
              </Row>

              {/* Contactos */}
              <Row form>
                <Col md="6">
                  <FormGroup>
                    <label htmlFor="email">Email</label>
                    <FormInput
                      id="email"
                      type="email"
                      placeholder="nome@exemplo.pt"
                      required
                    />
                  </FormGroup>
                  <FormFeedback
                    id="emailFeedback"
                    valid={false}
                    style={{ display: "none" }}
                  >
                    Por favor, preencha este campo
                  </FormFeedback>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label htmlFor="phone">
                      Telemóvel / Telefone (opcional)
                    </label>
                    <FormInput id="phone" type="tel" placeholder="200345678" />
                    <FormFeedback
                      id="phoneFeedback"
                      valid={false}
                      style={{ display: "none" }}
                    >
                      Por favor, preencha este campo
                    </FormFeedback>
                  </FormGroup>
                </Col>
              </Row>

              {this.state.extraParent}

              <hr />

              <FormGroup>
                <label htmlFor="studentName">Nome Aluno</label>
                <FormInput
                  id="studentName"
                  type="text"
                  placeholder="Nome"
                  required
                />
                <FormFeedback
                  id="studentNameFeedback"
                  valid={false}
                  style={{ display: "none" }}
                >
                  Por favor, preencha este campo
                </FormFeedback>
              </FormGroup>

              {/* Descricao Textarea */}
              <FormGroup>
                <label htmlFor="studentYear">Ano Escolaridade</label>
                <FormInput
                  id="studentYear"
                  type="text"
                  placeholder="5º"
                  required
                />
                <FormFeedback
                  id="studentYearFeedback"
                  valid={false}
                  style={{ display: "none" }}
                >
                  Por favor, preencha este campo
                </FormFeedback>
              </FormGroup>

              {this.state.extraStudent}
              {this.state.moreStudents}
            </Form>
          </Col>
        </ListGroupItem>

        <ListGroupItem className="p-3">
          <Col>
            <Form>
              <Row form>
                <Col md="12" className="form-group">
                  <FormGroup>
                    <FormCheckbox id="policyCheckbox">
                      {/* eslint-disable-next-line */}Li e aceito a{" "}
                      <a href="#">Política de Privacidade</a>.
                    </FormCheckbox>
                    <FormFeedback
                      id="policyCheckboxFeedback"
                      valid={false}
                      style={{ display: "none" }}
                    >
                      Para efectuar a inscrição, precisa de aceitar a Política
                      de Privacidade
                    </FormFeedback>
                  </FormGroup>
                  <Button onClick={this.sendForm}>Enviar</Button>{" "}
                  <Button onClick={this.addStudent}>
                    Adicionar mais um aluno
                  </Button>
                  <Link
                    to="/login"
                    style={{ float: "right" }}
                    className="text-primary"
                  >
                    <Button>
                      <span>Cancelar</span>
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Form>
          </Col>
        </ListGroupItem>
      </ListGroup>
    );
  }
}

export default Register_Page;

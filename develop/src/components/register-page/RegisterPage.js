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
  FormFeedback,
} from "shards-react";
import "react-toastify/dist/ReactToastify.css";
import { Label, Input } from "reactstrap";
import { Link, Redirect, Route } from "react-router-dom";
import {saveRegistToDB, validZip} from "../../firebase_scripts/installation";
import {
  getGravatarURL,
  languageCode, parentsParameters,
  regular_role_PT
} from "../../utils/general_utils";
import {
  firestore,
  firebase_auth,
  firebase,
  firebaseConfig,
} from "../../firebase-config";

class Register_Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blocking: false,
      errors: {},
      parentName: "",
      parentNameFeedback: null,
      nif: "",
      job: "",
      cc : "",
      ccFeedback : null,
      nifFeedback: null,
      morada : "",
      moradaFeedback : null,
      localidade: "",
      localidadeFeedback: null,
      zipCode: "",
      zipCodeFeedback: null,
      email: "",
      emailFeedback: null,
      phone: null,
      nomeAluno: [""], //Store multiple names
      nomeAlunoFeedBack: [null], //Store feedback for multiple names -> not working for students other than the first one
      anoEscolaridade: [""],
      anoEscolaridadeFeedBack: [null],
      checkBoxStatus: false,

      extraParent: null,
      extraStudent: null,
      moreStudents: null,
      studentNumber: 1, //Counts number of students
      extraVars: [{}],
      extraPai: 0, //Counts number of extra parameters that belong to the parent part -> they are stored in extraVars[0] along with the extra values from the first student
      redirect: null,
    };

    this.renderExtra = this.renderExtra.bind(this);
    this.sendForm = this.sendForm.bind(this);
    this.addStudent = this.addStudent.bind(this);
    this.handleChangeCheckBox = this.handleChangeCheckBox.bind(this);
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


  handleChangeCheckBox() {
    var { checkBoxStatus } = this.state;

    if (checkBoxStatus) {
      checkBoxStatus = false;
    } else {
      checkBoxStatus = true;
    }

    this.setState({ checkBoxStatus: checkBoxStatus });
  }

  /**
    Function to verify and process all data
   */
  sendForm() {
    var {
      parentName,
      nif,
      cc,
      job,
      morada,
      zipCode,
      localidade,
      zipCode,
      email,
      phone,
      nomeAluno,
      nomeAlunoFeedBack,
      anoEscolaridade,
      anoEscolaridadeFeedBack,
      extraStudent,
      moreStudents,
      studentNumber,
      extraVars,
      extraPai,
      checkBoxStatus,
    } = this.state;

    //Remove all warnings at the beggining
    var nomeAlunoFeedBackArray = nomeAlunoFeedBack;
    for (var i = 0; i < nomeAlunoFeedBackArray.length; i++) {
      nomeAlunoFeedBackArray[i] = false;
    }
    var anoEscolaridadeFeedBackArray = anoEscolaridadeFeedBack;
    for (var q = 0; q < anoEscolaridadeFeedBackArray.length; q++) {
      anoEscolaridadeFeedBackArray[q] = false;
    }

    this.setState({
      parentNameFeedback: false,
      ccFeedback : false,
      moradaFeedback : false,
      nifFeedback: false,
      localidadeFeedback: false,
      zipCodeFeedback: false,
      emailFeedback: false,
      nomeAlunoFeedBack: nomeAlunoFeedBackArray,
      anoEscolaridadeFeedBack: anoEscolaridadeFeedBackArray,
    });

    //Verify values were inserted and show feedback if not
    var allRequiredDataFilled = true;
    if (parentName === "") {
      allRequiredDataFilled = false;
      this.setState({ parentNameFeedback: true });
    }
    if (nif === "") {
      allRequiredDataFilled = false;
      this.setState({ nifFeedback: true });
    }
    if (morada === "") {
      allRequiredDataFilled = false;
      this.setState({ moradaFeedback: true });
    }
    if (localidade === "") {
      allRequiredDataFilled = false;
      this.setState({ localidadeFeedback: true });
    }
    if (zipCode === "" || !validZip(zipCode)) {
      allRequiredDataFilled = false;
      this.setState({ zipCodeFeedback: true });
    }
    if (email === "" || !email.match(/.+@.+/)) {
      allRequiredDataFilled = false;
      this.setState({ emailFeedback: true });
    }
    for (var x = 0; x < nomeAluno.length; x++) {
      if (nomeAluno[x] === "") {
        allRequiredDataFilled = false;
        nomeAlunoFeedBackArray[x] = true; //not working, using alert method
        if (x != 0) {
          var n = x + 1;
          alert("Por favor preencha o nome do " + n + "º aluno!");
        }
      }
    }
    for (var a = 0; a < anoEscolaridade.length; a++) {
      if (anoEscolaridade[a] === "") {
        allRequiredDataFilled = false;
        anoEscolaridadeFeedBackArray[a] = true;
        if (a !== 0) {
          var n = a + 1;
          alert(
            "Por favor preencha o ano de escolaridade do " + n + "º aluno!"
          );
        }
      }
    }
    this.setState({
      nomeAlunoFeedBack: nomeAlunoFeedBackArray,
      anoEscolaridadeFeedBack: anoEscolaridadeFeedBackArray,
    });

    //Same verification process for extraVars
    var breakVar = false;
    for (var i = 0; i < extraVars.length; i++) {
      var currentArray = extraVars[i];
      var keys = Object.keys(currentArray);
      if (breakVar) break;

      keys.forEach((key) => {
        if (currentArray[key] === "" && !breakVar) {
          var message = "Por favor, preencha " + key.split("-")[0];
          allRequiredDataFilled = false;
          alert(message);
          breakVar = true;
        }
      });
    }

    if (!checkBoxStatus) {
      alert("Por favor, indique que leu a política de privacidade.");
      allRequiredDataFilled = false;
    }

    //All date was inserted, process it to database
    if (allRequiredDataFilled) {
      //console.log("Dados todos: " + JSON.stringify(this.state));

      //Parent Json
      var parentJson = {};
      parentJson[parentsParameters.NAME[languageCode]] = parentName;
      parentJson[parentsParameters.NIF[languageCode]] = nif;
      if (job !== "") {
        parentJson[parentsParameters.JOB[languageCode]] = job;
      }
      parentJson[parentsParameters.CITY[languageCode]] = localidade;
      parentJson[parentsParameters.ZIPCODE[languageCode]] = zipCode;
      parentJson[parentsParameters.EMAIL[languageCode]] = email;
      parentJson[parentsParameters.PHONE[languageCode]] = phone;

      // Get extra parent values and store in Json -> they are in extraVars[0] along with student extra values and there are extraPai number of parent values
      var extraArray = extraVars[0]; // Dictionary of values

      for (var i = 0; i < extraPai; i++) {
        var keys = Object.keys(extraArray);
        var key = keys[i];
        parentJson[key] = extraArray[key];
      }
      parentJson.Validated = false;
      parentJson[parentsParameters.ASSOC_NUMBER[languageCode]] = ""; // TODO generate a new number
      parentJson[parentsParameters.PAYED_FEE[languageCode]] = false;
      var date = new Date();
      parentJson[parentsParameters.REGISTER_DATE[languageCode]] = date;
      parentJson[parentsParameters.FEES[languageCode]] = [];
      parentJson[parentsParameters.CC[languageCode]] = cc;
      parentJson.blocked = false;
      parentJson[parentsParameters.ADMIN[languageCode]] = false;
      parentJson[parentsParameters.ROLE[languageCode]] = regular_role_PT;
      parentJson[parentsParameters.STREET[languageCode]] = morada;

      // avatar
      parentJson[parentsParameters.PHOTO[languageCode]] = getGravatarURL(email);

      // Student's part
      var studentArray = [];
      for (var i = 0; i < extraVars.length; i++) {
        var currentArray = extraVars[i];
        var keys = Object.keys(currentArray);

        var studentJson = {};

        //Nome aluno
        studentJson.Nome = nomeAluno[i];
        //Ano de escolaridade
        studentJson.Ano = anoEscolaridade[i];

        var x = 0;
        keys.forEach((key) => {
          //Exclude parents extra values
          if (i == 0 && x < extraPai) {
            //Do nothing, skip these vars
          } else {
            studentJson[key.split("-")[0]] = currentArray[key];
          }

          x++;
        });
        studentArray.push(studentJson);
      }
      parentJson[parentsParameters.CHILDREN[languageCode]] = studentArray;

      //Save values to database
      saveRegistToDB(parentJson);
      const project_id = firebaseConfig.projectId;
      let uri =
        "https://us-central1-" +
        project_id +
        ".cloudfunctions.net/api/sendRegisterEmail?" +
        "email=" +
        email +
        "&" +
        "nome=" +
        parentName;
      const request = async () => {
        let resposta;
        await fetch(uri)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function (data) {
            console.log("ShowEmaildata: ", data);
            resposta = data;
          })
          .catch(function (error) {
            console.log(error);
          });

        return resposta;
      };

      request();

      var red = (
        <Redirect
          to={{
            pathname: "/login",
            state: {
              msg:
                "Para concluir o registo, terá de pagar a 1ª prestação, fazer login e confirmar o pagamento e aguardar aprovação!",
            },
          }}
        />
      );
      this.setState({ redirect: red });
    }
  }

  /**
    Function to add new student to form
   */
  addStudent() {
    var {
      studentNumber,
      nomeAluno,
      nomeAlunoFeedBack,
      anoEscolaridade,
      anoEscolaridadeFeedBack,
      extraStudent,
      moreStudents,
    } = this.state;

    var this_ = this;

    var dadosFinaisAluno = null;

    //Get student parameters from database
    const extrasDoc = firestore.doc("initialConfigs/newParameters");
    extrasDoc
      .get()
      .then((doc) => {
        if (doc.exists === true) {
          const dataDoc = doc.data();

          const studentData = dataDoc["aluno"];
          if (studentData !== undefined) {
            var keys = Object.keys(studentData);

            var dadosAluno = [];
            for (var i = 0; i < keys.length; i++) {
              var valS = keys[i];
              var type = studentData[valS];
              var step = null;

              if (type.includes("text")) {
                type = "text";
              } else if (type.includes("int")) {
                type = "number";
                step = "1";
              } else if (type.includes("decimal")) {
                type = "number";
                step = "0.1";
              }

              var idS = valS + "-" + studentNumber; //Id now contains a unique number to identify it

              //Create dictionary for this student's values and add it to extraVars
              var newArrayExtras1 = this.state.extraVars; //Get array of dictionaries
              var newVar;
              if (i == 0) {
                newVar = { [idS]: "" };
              } else {
                newVar = { ...this.state.extraVars[studentNumber], [idS]: "" };
              }
              newArrayExtras1[studentNumber] = newVar;
              this.setState({ extraVars: newArrayExtras1 });

              const n = studentNumber;

              //Object to render
              var dado = (
                <FormGroup>
                  <label htmlFor={idS}>{valS}</label>
                  <FormInput
                    id={idS}
                    type={type}
                    step={step}
                    placeholder={valS}
                    onChange={(e) => {
                      var extrasArray = this.state.extraVars;
                      var newExtraVars = {
                        ...this.state.extraVars[n],
                        [e.target.id]: e.target.value,
                      };
                      extrasArray[n] = newExtraVars;
                      this.setState({
                        extraVars: extrasArray,
                      });
                    }}
                  />
                </FormGroup>
              );
              dadosAluno.push(dado);
            }

            dadosFinaisAluno = dadosAluno;

            //Similar process to name and year of student
            var novoArrayAlunos = nomeAluno.concat("");
            var novoArrayNomeAlunoFeedBack = nomeAlunoFeedBack.concat(null); //not working, we are using alert method
            var novoArrayAnoEscolaridade = anoEscolaridade.concat("");
            var novoArrayAnoEscolaridadeFeedBack = anoEscolaridadeFeedBack.concat(
              null
            );

            this_.setState({
              nomeAluno: novoArrayAlunos,
              nomeAlunoFeedBack: novoArrayNomeAlunoFeedBack,
              anoEscolaridade: novoArrayAnoEscolaridade,
              anoEscolaridadeFeedBack: novoArrayAnoEscolaridadeFeedBack,
            });

            var newName = "studentName-" + studentNumber;
            var newNameFeedback = newName + "FeedBack";
            var newYear = "studentYear-" + studentNumber;
            var newYearFeedback = newYear + "FeedBack";
            const x = studentNumber;

            var add = (
              <Fragment>
                <hr />
                <FormGroup>
                  <label htmlFor="studentName">Nome Aluno</label>
                  <FormInput
                    invalid={this_.state.nomeAlunoFeedBack[x]}
                    onChange={(e) => {
                      var newAdd = novoArrayAlunos;
                      var n = e.target.id.split("-")[1];
                      newAdd[n] = e.target.value;
                      this.setState({
                        nomeAluno: newAdd,
                      });
                    }}
                    id={newName}
                    type="text"
                    placeholder="Nome"
                    required
                  />
                  <FormFeedback
                    id={newNameFeedback}
                    valid={false}
                    style={{ display: "d-block" }}
                  >
                    Por favor, preencha este campo
                  </FormFeedback>
                </FormGroup>

                {/* Descricao Textarea */}
                <FormGroup>
                  <label htmlFor="studentYear">Ano Escolaridade</label>
                  <FormInput
                    invalid={this_.state.anoEscolaridadeFeedBack[x]}
                    onChange={(e) => {
                      var newAdd = novoArrayAnoEscolaridade;
                      var n = e.target.id.split("-")[1];
                      newAdd[n] = e.target.value;
                      this.setState({
                        anoEscolaridade: newAdd,
                      });
                    }}
                    id={newYear}
                    type="text"
                    placeholder="5º"
                    required
                  />
                  <FormFeedback
                    id={newYearFeedback}
                    valid={false}
                    style={{ display: "d-block" }}
                  >
                    Por favor, preencha este campo
                  </FormFeedback>
                </FormGroup>
                {dadosFinaisAluno}
              </Fragment>
            );

            studentNumber++; //Increase studentNumber

            var arrayAnterior = moreStudents;
            if (moreStudents == null) {
              arrayAnterior = [add];
            } else {
              arrayAnterior = [moreStudents].concat(add);
            }

            this_.setState({
              moreStudents: arrayAnterior,
              studentNumber: studentNumber,
            });
          }
        } else {
          console.log("doc não existe");
        }
      })
      .catch((err) => {
        alert(err);
      });
  }

  /**
    Function to get extra parameters for parent and students from firestore and load them
   */
  renderExtra() {
    var { extraParent, extraStudent, moreStudents, extraVars } = this.state;
    var this_ = this;

    var dadosFinaisPai = null;
    var dadosFinaisAluno = null;

    const extrasDoc = firestore.doc("initialConfigs/newParameters");
    extrasDoc
      .get()
      .then((doc) => {
        if (doc.exists === true) {
          const dataDoc = doc.data();
          //console.log("dados extras: " + JSON.stringify(dataDoc));

          const eeData = dataDoc["EE"]; // Get parent dictionary of extra parameters
          if (eeData !== undefined) {
            var keys = Object.keys(eeData);

            var extraPai = 0; // Counts number of extra parameters that belong to the parent part of the registry

            var dadosPai = []; // Will store all objects to render from the parent side
            for (var i = 0; i < keys.length; i++) {
              extraPai++;
              var val = keys[i]; // Actual name of parameter
              var type = eeData[val]; //Type of parameter (text, inteiro, etc)

              //Change type to html equivalent
              if (type.includes("text")) {
                type = "text";
              } else if (type.includes("int")) {
                type = "number";
              }

              //These following lines add parameter to extraVars array of dictionaries (extraVars stores the actual user input)
              var newArrayExtras = this.state.extraVars; // Array of dictionaries
              var newVar = { ...this.state.extraVars[0], [val]: "" }; // Add parameter(val) to first dictionary
              newArrayExtras[0] = newVar;
              this.setState({ extraVars: newArrayExtras });

              // Objects to render
              var dado = (
                <FormGroup>
                  <label htmlFor={val}>{val}</label>
                  <FormInput
                    id={val}
                    type={type}
                    placeholder={val}
                    onChange={(e) => {
                      var extrasArray = this.state.extraVars;
                      var newExtraVars = {
                        ...this.state.extraVars[0],
                        [e.target.id]: e.target.value,
                      };
                      extrasArray[0] = newExtraVars;
                      this.setState({
                        extraVars: extrasArray,
                      });
                    }}
                  />
                  <FormFeedback
                    id={val + "Feedback"}
                    valid={false}
                    style={{ display: "d-block" }}
                  >
                    Por favor, preencha este campo
                  </FormFeedback>
                </FormGroup>
              );
              dadosPai.push(dado); //Add object to array
            }
            dadosFinaisPai = dadosPai;
          }

          // The following code follows the same parent logic, just for the student
          const studentData = dataDoc["aluno"];
          if (studentData !== undefined) {
            var keys = Object.keys(studentData);

            var dadosAluno = [];
            for (var i = 0; i < keys.length; i++) {
              var valS = keys[i];
              var type = studentData[valS];
              var step = null;

              if (type.includes("text")) {
                type = "text";
              } else if (type.includes("int")) {
                type = "number";
                step = "1";
              } else if (type.includes("decimal")) {
                type = "number";
                step = "0.1";
              }

              var newArrayExtras1 = this.state.extraVars;
              var newVar = { ...this.state.extraVars[0], [keys[i]]: "" };
              newArrayExtras1[0] = newVar;
              this.setState({ extraVars: newArrayExtras1 }); //newVar

              var dado = (
                <FormGroup>
                  <label htmlFor={valS}>{valS}</label>
                  <FormInput
                    id={valS}
                    type={type}
                    step={step}
                    placeholder={valS}
                    onChange={(e) => {
                      var extrasArray = this.state.extraVars;
                      var newExtraVars = {
                        ...this.state.extraVars[0],
                        [e.target.id]: e.target.value,
                      };
                      extrasArray[0] = newExtraVars;
                      this.setState({
                        extraVars: extrasArray,
                      });
                    }}
                  />
                </FormGroup>
              );
              dadosAluno.push(dado);
            }
            dadosFinaisAluno = dadosAluno;
          }

          // Save data to state
          this_.setState({
            extraParent: dadosFinaisPai,
            extraStudent: dadosFinaisAluno,
            extraPai: extraPai,
          });
        } else {
          console.log("doc não existe");
        }
      })
      .catch((err) => {
        alert(err);
      });
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
                  invalid={this.state.parentNameFeedback}
                  id="parentName"
                  type="text"
                  placeholder="Nome"
                  required
                  onChange={(e) => {
                    this.setState({
                      parentName: e.target.value,
                    });
                  }}
                />
                <FormFeedback
                  id="parentNameFeedback"
                  valid={false}
                  style={{ display: "d-block" }}
                >
                  Por favor, preencha este campo
                </FormFeedback>
              </FormGroup>


              <Row form>
                <Col md="6" className="form-group">
                  <label htmlFor="nif">NIF</label>
                  <FormInput
                    invalid={this.state.nifFeedback}
                    id="nif"
                    type="text"
                    placeholder="NIF"
                    required
                    onChange={(e) => {
                      this.setState({
                        nif: e.target.value,
                      });
                    }}
                  />
                  <FormFeedback
                    id="nifFeedback"
                    valid={false}
                    style={{ display: "d-block" }}
                  >
                    Por favor, preencha este campo
                  </FormFeedback>
                </Col>

                <Col md="6" className="form-group">
                  <label htmlFor="cc">Cartão de Cidadão (opcional)</label>
                  <FormInput
                    invalid={this.state.ccFeedback}
                    id="cc"
                    type="text"
                    placeholder="Número do Cartão de Cidadão"
                    /*required*/
                    onChange={(e) => {
                      this.setState({
                        cc: e.target.value,
                      });
                    }}
                  />
                  <FormFeedback
                    id="ccFeedback"
                    valid={false}
                    style={{ display: "d-block" }}
                  >
                    Por favor, preencha este campo
                  </FormFeedback>
                </Col>

              </Row>

              <FormGroup>
                <label htmlFor="job">Profissão (opcional)</label>
                <FormInput
                  onChange={(e) => {
                    this.setState({
                      job: e.target.value,
                    });
                  }}
                  id="job"
                  placeholder="Profissão"
                />
              </FormGroup>

              <FormGroup>
                <label htmlFor="morada">Morada</label>
                <FormInput
                  invalid={this.state.moradaFeedback}
                  required
                  id="morada"
                  placeholder="Rua Dr. Ricardo Silva, 276 R/C Dto"
                  onChange={(e) => {
                    this.setState({
                      morada: e.target.value,
                    });
                  }}
                />
                <FormFeedback id="moradaFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
              </FormGroup>

              <Row form>
                <Col md="6" className="form-group">
                  <label htmlFor="localidade">Localidade</label>
                  <FormInput
                    required
                    invalid={this.state.localidadeFeedback}
                    id="localidade"
                    onChange={(e) => {
                      this.setState({
                        localidade: e.target.value,
                      });
                    }}
                  />
                  <FormFeedback
                    id="localidadeFeedback"
                    valid={false}
                    style={{ display: "d-block" }}
                  >
                    Por favor, preencha este campo
                  </FormFeedback>
                </Col>
                <Col md="6" className="form-group">
                  <label htmlFor="zipCode">Código Postal</label>
                  <FormInput
                    required
                    invalid={this.state.zipCodeFeedback}
                    id="zipCode"
                    onChange={(e) => {
                      this.setState({
                        zipCode: e.target.value,
                      });
                    }}
                  />
                  <FormFeedback
                    id="zipCodeFeedback"
                    valid={false}
                    style={{ display: "d-block" }}
                  >
                    Por favor, preencha este campo
                  </FormFeedback>
                </Col>
              </Row>

              {/* Contactos */}
              <Row form>
                <Col md="6">
                  <label htmlFor="email">Email</label>
                  <FormInput
                    invalid={this.state.emailFeedback}
                    onChange={(e) => {
                      this.setState({
                        email: e.target.value,
                      });
                    }}
                    id="email"
                    type="email"
                    placeholder="nome@exemplo.pt"
                    required
                  />
                  <FormFeedback
                    id="emailFeedback"
                    valid={false}
                    style={{ display: "d-block" }}
                  >
                    Por favor, preencha este campo
                  </FormFeedback>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label htmlFor="phone">
                      Telemóvel / Telefone (opcional)
                    </label>
                    <FormInput
                      invalid={this.state.phoneFeedback}
                      onChange={(e) => {
                        this.setState({
                          phone: e.target.value,
                        });
                      }}
                      id="phone"
                      type="tel"
                      placeholder="200345678"
                    />
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
                  invalid={this.state.nomeAlunoFeedBack[0]}
                  onChange={(e) => {
                    var newAdd = this.state.nomeAluno;
                    newAdd[0] = e.target.value;
                    this.setState({
                      nomeAluno: newAdd,
                    });
                  }}
                  id="studentName"
                  type="text"
                  placeholder="Nome"
                  required
                />
                <FormFeedback
                  id="studentNameFeedback"
                  valid={false}
                  style={{ display: "d-block" }}
                >
                  Por favor, preencha este campo
                </FormFeedback>
              </FormGroup>

              {/* Descricao Textarea */}
              <FormGroup>
                <label htmlFor="studentYear">Ano Escolaridade</label>
                <FormInput
                  invalid={this.state.anoEscolaridadeFeedBack[0]}
                  onChange={(e) => {
                    var newAdd1 = this.state.anoEscolaridade;
                    newAdd1[0] = e.target.value;
                    this.setState({
                      anoEscolaridade: newAdd1,
                    });
                  }}
                  id="studentYear"
                  type="text"
                  placeholder="5º"
                  required
                />
                <FormFeedback
                  id="studentYearFeedback"
                  valid={false}
                  style={{ display: "d-block" }}
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
                    <FormCheckbox
                      id="policyCheckbox"
                      checked={this.state.checkBoxStatus}
                      onChange={this.handleChangeCheckBox}
                    >
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
                    {this.state.redirect}
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

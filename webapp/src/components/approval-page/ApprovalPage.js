import React, { Component, Fragment } from "react";
import {
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  FormInput,
  FormGroup,
  Button,
  FormFeedback,
} from "shards-react";
import "react-toastify/dist/ReactToastify.css";
import {  Redirect } from "react-router-dom";
import {
  firestore,
  firebaseConfig,
} from "../../firebase-config";
import ApprovalModal from "./ApprovalModal";
import {
  cleanButton,
  languageCode,
  assocParameters,
  approvalPageLoading, parentsParameters,
} from "../../utils/general_utils";
import {deleteAccount} from "../../firebase_scripts/profile_functions";

class Approval_Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resgistosPorAprovar: null,
      dicionarioRegistos: null,
      blocking: false,
      errors: {},
      timer: null,
      redirect: null,

      extraParent: null,
      extraStudent: null,
      moreStudents: null,
      studentNumber: 1, //Counts number of students
      extraVars: [{}],
      extraPai: 0, //Counts number of extra parameters that belong to the parent part -> they are stored in extraVars[0] along with the extra values from the first student
      daysToDelete: 7,
    };

    this.renderExtra = this.renderExtra.bind(this);
    this.deletePassedRegisters = this.deletePassedRegisters.bind(this);
    this.reload = this.reload.bind(this);
    this.addStudent = this.addStudent.bind(this);
    this.getParentsToApprove = this.getParentsToApprove.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  reload() {
    this.setState({
      dicionarioRegistos: null,
      resgistosPorAprovar: null,
    });
    this.getParentsToApprove();
    this.renderExtra();
  }

  componentDidMount() {
    //this._isMounted = true;

    const assocDoc = JSON.parse(window.localStorage.getItem("assocDoc"));
    if (assocDoc != null) {
      let daysToDelete =
        assocDoc[assocParameters.DAYS_TO_DELETE_REGISTRATION[languageCode]];
      daysToDelete = parseInt(daysToDelete, 10);

      if (daysToDelete != null) {
        this.setState({ daysToDelete: daysToDelete });
      }
    }

    this.getParentsToApprove();
    this.renderExtra();

    //var timer = setInterval(() => this.deletePassedRegisters(), 1000 * 30 * 1);
    //this.setState({ timer: timer });

    const this_ = this;
    var currentUser = JSON.parse(window.localStorage.getItem("userDoc"));
    if (currentUser != null) {
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

  componentWillUnmount() {
    clearInterval(this.state.timer);
    this._isMounted = false;
  }

  deletePassedRegisters() {
    const { resgistosPorAprovar, daysToDelete } = this.state;
    const this_ = this;
    const project_id = firebaseConfig.projectId;

    if (resgistosPorAprovar != null) {
      for (let i = 0; i < resgistosPorAprovar.length; i++) {
        let json = resgistosPorAprovar[i];

        let data = json["Data inscricao"];

        if (data != null) {
          let date = new Date(data._seconds * 1000);
          let days = daysToDelete;
          let compareDate = new Date(date.getTime() + days * 86400000);
          let today = new Date();

          if (compareDate.getTime() < today.getTime()) {
            deleteAccount(json[parentsParameters.EMAIL[languageCode]]).then(() => {
              let uri =
                "https://us-central1-" +
                project_id +
                ".cloudfunctions.net/api/sendRejectedEmail?" +
                "email=" +
                json[parentsParameters.EMAIL[languageCode]] +
                "&" +
                "nome=" +
                json[parentsParameters.NAME[languageCode]];
              const request = async () => {
                let resposta;
                await fetch(uri)
                  .then((resp) => resp.json())
                  .then(function (data) {
                    resposta = data;
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              };
              return request();
            });
          }
        }
      }
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

  getParentsToApprove() {
    var this_ = this;
    const project_id = firebaseConfig.projectId;
    let uri =
      "https://us-central1-" +
      project_id +
      ".cloudfunctions.net/api/getParents";
    const request = async () => {
      let resposta;
      await fetch(uri)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
          //console.log("ShowEmaildata: ", data);
          var resgistosPorAprovar = [];
          var dicionarioRegistos = {};
          for (var i = 0; i < data.length; i++) {
            if (
              data[i]["Validated"] != undefined &&
              data[i]["Validated"] != null &&
              data[i]["Validated"].toString() == "false"
            ) {
              if (
                data[i]["Quotas pagas"] != undefined &&
                data[i]["Quotas pagas"] != null &&
                (data[i]["Quotas pagas"].toString() == "Não" ||
                  data[i]["Quotas pagas"].toString() == "false")
              ) {
                resgistosPorAprovar.push(data[i]);
                var title = data[i]["Email"];
                dicionarioRegistos[title] = data[i];
              }
            }
          }
          this_.setState({
            dicionarioRegistos: dicionarioRegistos,
            resgistosPorAprovar: resgistosPorAprovar,
          });
        })
        .catch(function (error) {
          console.log(error);
        });
      return resposta;
    };

    var dados = request();
  }

  showDetails(e) {}
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
      <ListGroup flush value={"titulo"}>
        <ListGroupItem className="p-3">
          <Col>
            <Row>
              {this.state.resgistosPorAprovar &&
              this.state.dicionarioRegistos ? (
                this.state.resgistosPorAprovar.map((post, idx) => (
                  <Col lg="4" key={idx}>
                    <Card small className="card-post mb-4">
                      <CardBody>
                        <h5 className="card-title">{post.Nome}</h5>
                        <p
                          className="card-text text-muted"
                          style={{
                            whiteSpace: "nowrap",
                            width: "inherit",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {post.Email}
                        </p>
                      </CardBody>
                      <CardFooter className="border-top d-flex">
                        <div className="card-post__author d-flex"></div>
                        <div className="my-auto ml-auto">
                          <ApprovalModal
                            dados={
                              this.state.dicionarioRegistos
                                ? this.state.dicionarioRegistos[post.Email]
                                : ""
                            }
                            parentComponent={this}
                            componentDidMount={this.componentDidMount}
                          />
                        </div>
                      </CardFooter>
                    </Card>
                  </Col>
                ))
              ) : (
                <div>{approvalPageLoading[languageCode]}</div>
              )}
            </Row>
          </Col>
          {this.state.redirect}
          <Button theme="danger" onClick={this.deletePassedRegisters}>
            {cleanButton[languageCode]}
          </Button>
        </ListGroupItem>
      </ListGroup>
    );
  }
}

export default Approval_Page;

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
import { toast, Bounce } from "react-toastify";
import { Link, Redirect } from "react-router-dom";
import {
  commitChangesQuotasMessage,
  sucessoGeral,
} from "../../utils/messages_strings";
import { languageCode, showToast, toastTypes } from "../../utils/general_utils";
import { saveChanges, error_geral } from "../../utils/common_strings";

import {
  firestore,
  firebase_auth,
  firebase,
  firebaseConfig,
} from "../../firebase-config";
import PageTitle from "../common/PageTitle";
import Quotas_Modal from "./QuotasModal";

class Quotas_Page extends Component {
  constructor(props) {
    super(props);

    var email = this.props.email;

    this.state = {
      blocking: false,
      errors: {},
      items: [], // Array of Json Objects
      checkBoxPagante: [],
      checkBoxRecetor: [],
      notas: [],
      email: email,
      nome: null,
      admin: null,
      redirect: null,
      dialogOpen: false,
      userAnswer: false,
    };

    const this_ = this;

    this.getQuotas = this.getQuotas.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.handleChangeCheckBoxRecetor = this.handleChangeCheckBoxRecetor.bind(
      this
    );
    this.handleChangeCheckBoxPagante = this.handleChangeCheckBoxPagante.bind(
      this
    );
    this.handleChangeNotas = this.handleChangeNotas.bind(this);
    this.commit = this.commit.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.getSortOrder = this.getSortOrder.bind(this);
    this.getQuotas();
  }

  componentDidMount() {
    const this_ = this;
    const project_id = firebaseConfig.projectId;
    var currentUser = JSON.parse(window.localStorage.getItem("userDoc"));
    if (currentUser != null) {
      if (this_.state.email != null) {
        let uri =
          "https://us-central1-" +
          project_id +
          ".cloudfunctions.net/api/getParent?" +
          "id=" +
          this_.state.email;
        const request = async () => {
          let resposta;
          await fetch(uri)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function (data) {
              if (data.Nome != undefined && data.Nome != null) {
                this_.setState({
                  nome: data.Nome.toString(),
                  admin: data.Admin,
                });
              }
            })
            .catch(function (error) {
              //console.log(error);
            });
          return resposta;
        };
        request();
      }
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
    const { items, checkBoxPagante, checkBoxRecetor, notas } = this.state;
    const this_ = this;

    var arrayToChange = [];
    for (var i = 0; i < items.length; i++) {
      var json = items[i];
      var emissor = checkBoxPagante[i];
      var recetor = checkBoxRecetor[i];
      var nota = notas[i];

      if (
        json["Confirmado_Pagante"] != emissor ||
        json["Confirmado_Recetor"] != recetor ||
        json["Notas"] != nota
      ) {
        var jsonValues = {};
        jsonValues.id = json.id;
        jsonValues.emissor = emissor;
        jsonValues.recetor = recetor;
        jsonValues.nota = nota;
        arrayToChange.push(jsonValues);
      }
    }

    if (arrayToChange.length !== 0) {
      if (window.confirm(commitChangesQuotasMessage[languageCode])) {
        // Save it!
        this_.commit();
      } else {
        // Do nothing!
      }
    }
  }

  async commit() {
    const { items, checkBoxPagante, checkBoxRecetor, notas } = this.state;
    const project_id = firebaseConfig.projectId;
    const this_ = this;

    var arrayToChange = [];
    for (var i = 0; i < items.length; i++) {
      var json = items[i];

      var emissor = checkBoxPagante[i];
      var recetor = checkBoxRecetor[i];
      var nota = notas[i];

      if (
        json["Confirmado_Pagante"] != emissor ||
        json["Confirmado_Recetor"] != recetor ||
        json["Notas"] != nota
      ) {
        var jsonValues = {};

        jsonValues.id = json.id;
        jsonValues.confirmado_emissor = emissor;
        jsonValues.emissor_id = json.Pagante.Id;
        jsonValues.confirmado_recetor = recetor;
        jsonValues.recetor_nome = json.Recetor.Nome;
        jsonValues.recetor_id = json.Recetor.Id;
        jsonValues.nota = nota;
        arrayToChange.push(jsonValues);
      }
    }

    if (arrayToChange.length == 0) {
      var message = "Não há alterações a salvar!";
      toast.configure();
      toast(message, {
        transition: Bounce,
        closeButton: true,
        autoClose: 10000,
        position: "top-right",
        type: "warning",
      });
    }

    for (var x = 0; x < arrayToChange.length; x++) {
      var jsonToChange = arrayToChange[x];

      let uri =
        "https://us-central1-" +
        project_id +
        ".cloudfunctions.net/api/updateCota?" +
        "id=" +
        jsonToChange.id +
        "&recetor_id=" +
        encodeURIComponent(jsonToChange.recetor_id) +
        "&recetor_nome=" +
        encodeURIComponent(jsonToChange.recetor_nome) +
        "&confirmado_recetor=" +
        encodeURIComponent(jsonToChange.confirmado_recetor) +
        "&confirmado_emissor=" +
        encodeURIComponent(jsonToChange.confirmado_emissor) +
        "&notas=" +
        encodeURIComponent(jsonToChange.nota);

      const request = () => {
        return fetch(uri)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function (data) {
            console.log("data v");
            console.log(data);
            showToast(sucessoGeral[languageCode], 5000, toastTypes.SUCCESS);
          })
          .catch(function (error) {
            showToast(error_geral[languageCode], 5000, toastTypes.ERROR);
          });
      };

      console.log("passo 1");
      await request();
    }

    console.log("passo 2");
    this_.getQuotas();
  }

  //Comparer Function
  getSortOrder(prop) {
    return function (a, b) {
      if (a[prop] > b[prop]) {
        return -1;
      } else if (a[prop] < b[prop]) {
        return 1;
      }
      return 0;
    };
  }

  getQuotas() {
    var this_ = this;
    const project_id = firebaseConfig.projectId;

    let uri =
      "https://us-central1-" + project_id + ".cloudfunctions.net/api/getCotas";
    const request = async () => {
      let resposta;
      await fetch(uri)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
          if (data === "" || data == null) {
            //Nothing to do
          } else {
            var arrayOfDocs = data; // []
            arrayOfDocs.sort(this_.getSortOrder("Ano Letivo"));

            var arrayOfPaganteValues = [];
            var arrayOfRecetorValues = [];
            var arrayNotas = [];
            for (let i in arrayOfDocs) {
              let json = arrayOfDocs[i];
              arrayOfPaganteValues.push(json["Confirmado_Pagante"]);
              arrayOfRecetorValues.push(json["Confirmado_Recetor"]);
              var nota = "";
              if (json["Notas"] != undefined && json["Notas"] != null) {
                nota = json["Notas"];
              }
              arrayNotas.push(nota);
            }

            // Save data to state
            this_.setState({
              items: arrayOfDocs,
              checkBoxPagante: arrayOfPaganteValues,
              checkBoxRecetor: arrayOfRecetorValues,
              notas: arrayNotas,
            });
          }
        })
        .catch(function (error) {
          //console.log(error);
        });
      return resposta;
    };
    request();
  }

  renderTableData() {
    var { checkBoxPagante, checkBoxRecetor } = this.state;
    var id = 0;
    return this.state.items.map((item, index) => {
      const { Data, Pagante, Recetor, Valor, Notas } = item; //destructuring
      var Ano = item["Ano_Letivo"];
      var confirmadoRecetor = item["Confirmado_Recetor"];
      var confirmadoPagante = item["Confirmado_Pagante"];

      const x = id;
      id++;
      return (
        <tr key={id}>
          <td>{Data}</td>
          <td>{Recetor.Nome}</td>
          <td>{Pagante.Nome}</td>
          <td>{Valor}</td>
          <td>{Ano}</td>
          <td>
            <input
              type="checkbox"
              checked={this.state.checkBoxRecetor[x]}
              disabled={
                this.state.email != Recetor.Id ? true : false //this.state.checkBoxRecetor[x]
              }
              onChange={this.handleChangeCheckBoxRecetor.bind(this, x)}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={this.state.checkBoxPagante[x]}
              disabled={
                this.state.email != Pagante.Id ? true : false //this.state.checkBoxPagante[x]
              }
              onChange={this.handleChangeCheckBoxPagante.bind(this, x)}
            />
          </td>
          <td style={{ width: "150px" }}>
            <textarea
              class="form-control"
              rows="3"
              cols="3"
              style={{ resize: "none" }}
              id="comment"
              name={"notas-" + x}
              onChange={this.handleChangeNotas}
              value={this.state.notas[x]}
              disabled={this.state.email == Pagante.Id ? false : true}
            ></textarea>
          </td>
        </tr>
      );
    });
  }

  handleChangeCheckBoxRecetor(i) {
    if (this.state.checkBoxRecetor[i] == false) {
      //User confirmed action
      var array = this.state.checkBoxRecetor;
      array[i] = true;

      this.setState({ checkBoxRecetor: array });
    } else {
      var array = this.state.checkBoxRecetor;
      array[i] = false;

      this.setState({ checkBoxRecetor: array });
    }
  }

  handleChangeCheckBoxPagante(i) {
    if (this.state.checkBoxPagante[i] == false) {
      //User confirmed action
      var array = this.state.checkBoxPagante;
      array[i] = true;

      this.setState({ checkBoxPagante: array });
    } else {
      var array = this.state.checkBoxPagante;
      array[i] = false;

      this.setState({ checkBoxPagante: array });
    }
  }

  handleChangeNotas(e) {
    var name = e.target.name;
    var value = e.target.value;

    var index = name.split("-")[1];
    var arrayNotas = this.state.notas;
    arrayNotas[index] = value;
    this.setState({ notas: arrayNotas });
  }

  render() {
    return (
      <Container fluid className="main-content-container px-4">
        {/* Default Light Table */}
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">Validação de Pagamentos</h6>
              </CardHeader>
              <CardBody className="p-0 pb-3">
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
                        Data
                      </th>
                      <th scope="col" className="border-0">
                        Recetor
                      </th>
                      <th scope="col" className="border-0">
                        Emissor
                      </th>
                      <th scope="col" className="border-0">
                        Valor
                      </th>
                      <th scope="col" className="border-0">
                        Ano letivo
                      </th>
                      <th scope="col" className="border-0">
                        Confirmado pelo recetor
                      </th>
                      <th scope="col" className="border-0">
                        Confirmado pelo Emissor
                      </th>
                      <th
                        scope="col"
                        style={{ resize: "none", width: "100px" }}
                        className="border-0"
                      >
                        Notas/Descrição do Emissor<div> </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>{this.renderTableData()}</tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Col md={12} style={{ textAlign: "center" }}>
          {this.state.admin ? (
            <Quotas_Modal
              getQuotas={this.getQuotas}
              user_email={this.state.email}
              user_nome={this.state.nome}
            />
          ) : null}

          <Button
            theme="success"
            style={{
              //background: "#34b4eb",
              color: "#fff",
              width: "200px",
              textAlign: "center",
              margin: "8px",
            }}
            onClick={this.commit}
          >
            <i /> {saveChanges[languageCode]}
          </Button>
        </Col>
        {this.state.redirect}
      </Container>
    );
  }
}
export default Quotas_Page;

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

import { firestore, firebase_auth, firebase } from "../../firebase-config";
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
    };

    const this_ = this;

    if (email != null) {
      let uri =
        "https://us-central1-associacao-pais.cloudfunctions.net/api/getParent?" +
        "id=" +
        email;
      const request = async () => {
        let resposta;
        await fetch(uri)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function (data) {
            if (data.Nome != undefined && data.Nome != null) {
              this_.setState({ nome: data.Nome.toString(), admin: data.Admin });
            }
          })
          .catch(function (error) {
            console.log(error);
          });
        return resposta;
      };
      request();
    }

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
    this.getQuotas();
  }

  commit() {
    const { items, checkBoxPagante, checkBoxRecetor, notas } = this.state;
    const this_ = this;

    var arrayToChange = [];
    for (var i = 0; i < items.length; i++) {
      var json = items[i];
      var emissor = checkBoxPagante[i];
      var recetor = checkBoxRecetor[i];
      var nota = notas[i];

      if (
        json["Confirmado Pagante"] != emissor ||
        json["Confirmado Recetor"] != recetor ||
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

      const ref = firestore.collection("quotas").doc(jsonToChange.id);

      return ref
        .update({
          "Confirmado Pagante": jsonToChange.emissor,
          "Confirmado Recetor": jsonToChange.recetor,
          Notas: jsonToChange.nota,
        })
        .then(function () {
          var message = "Sucesso!";
          toast.configure();
          toast(message, {
            transition: Bounce,
            closeButton: true,
            autoClose: 2000,
            position: "top-right",
            type: "success",
          });
          this_.getQuotas();
        })
        .catch(function (error) {
          // The document probably doesn't exist.
          //console.error("Falha de gravação de alguma alteração, tente novamente!");
          var message =
            "Falha de gravação de alguma alteração, tente novamente!";
          toast.configure();
          toast(message, {
            transition: Bounce,
            closeButton: true,
            autoClose: 2000,
            position: "top-right",
            type: "error",
          });
        });
    }
  }

  getQuotas() {
    var this_ = this;

    const quotasDocs = firestore.collection("quotas");
    quotasDocs
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          console.log("No matching documents.");
          return;
        }

        var arrayOfDocs = [];
        var arrayOfPaganteValues = [];
        var arrayOfRecetorValues = [];
        var arrayNotas = [];
        snapshot.forEach((doc) => {
          //console.log(doc.id, "=>", doc.data());
          var json = doc.data();
          json.id = doc.id;
          arrayOfDocs.push(json);
          arrayOfPaganteValues.push(doc.data()["Confirmado Pagante"]);
          arrayOfRecetorValues.push(doc.data()["Confirmado Recetor"]);
          var nota = "";
          if (doc.data()["Notas"] != undefined && doc.data()["Notas"] != null) {
            nota = doc.data()["Notas"];
          }
          arrayNotas.push(nota);
        });

        // Save data to state
        this_.setState({
          items: arrayOfDocs,
          checkBoxPagante: arrayOfPaganteValues,
          checkBoxRecetor: arrayOfRecetorValues,
          notas: arrayNotas,
        });
      })
      .catch((err) => {
        console.log("Error getting documents", err);
      });
  }

  renderTableData() {
    var { checkBoxPagante, checkBoxRecetor } = this.state;
    var id = 0;
    return this.state.items.map((item, index) => {
      const { Data, Pagante, Recetor, Valor, Notas } = item; //destructuring
      var Ano = item["Ano Letivo"];
      var confirmadoRecetor = item["Confirmado Recetor"];
      var confirmadoPagante = item["Confirmado Pagante"];

      const x = id;
      id++;
      return (
        <tr key={id}>
          <td>{Data}</td>
          <td>{Recetor}</td>
          <td>{Pagante}</td>
          <td>{Valor}</td>
          <td>{Ano}</td>
          <td>
            <input
              type="checkbox"
              checked={this.state.checkBoxRecetor[x]}
              disabled={
                this.state.nome != Recetor ? true : false //this.state.checkBoxRecetor[x]
              }
              onChange={this.handleChangeCheckBoxRecetor.bind(this, x)}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={this.state.checkBoxPagante[x]}
              disabled={
                this.state.nome != Pagante ? true : false //this.state.checkBoxPagante[x]
              }
              onChange={this.handleChangeCheckBoxPagante.bind(this, x)}
            />
          </td>
          <td style={{ width: "150px" }}>
            <textarea
              class="form-control"
              rows="3"
              id="comment"
              name={"notas-" + x}
              onChange={this.handleChangeNotas}
              value={this.state.notas[x]}
              disabled={
                this.state.nome == Pagante || this.state.nome == Recetor
                  ? false
                  : true
              }
            ></textarea>
          </td>
        </tr>
      );
    });
  }

  handleChangeCheckBoxRecetor(i) {
    //console.log("função checkBox Recetor " + i);
    //TODO: Confirmar que utilizador a fazer clique é o correto

    if (this.state.checkBoxRecetor[i] == false) {
      if (window.confirm("Confirmar ação?")) {
        //User confirmed action
        var array = this.state.checkBoxRecetor;
        array[i] = true;

        this.setState({ checkBoxRecetor: array });
      } else {
        //User canceled, do nothing
      }
    } else {
      var array = this.state.checkBoxRecetor;
      array[i] = false;

      this.setState({ checkBoxRecetor: array });
    }
  }

  handleChangeCheckBoxPagante(i) {
    console.log("função checkBox Pagante " + i);
    if (this.state.checkBoxPagante[i] == false) {
      if (window.confirm("Confirmar ação?")) {
        //User confirmed action
        var array = this.state.checkBoxPagante;
        array[i] = true;

        this.setState({ checkBoxPagante: array });
      } else {
        //User canceled, do nothing
      }
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
                      <th scope="col" className="border-0">
                        Notas
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
            <Quotas_Modal getQuotas={this.getQuotas} />
          ) : null}

          <Button
            style={{
              background: "#34b4eb",
              color: "#fff",
              width: "200px",
              textAlign: "center",
              margin: "8px",
            }}
            onClick={this.commit}
          >
            <i /> Salvar alterações
          </Button>
        </Col>
      </Container>
    );
  }
}
export default Quotas_Page;

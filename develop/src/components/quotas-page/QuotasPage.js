import React, { Component, Fragment } from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "shards-react";

import { firestore, firebase_auth, firebase } from "../../firebase-config";
import PageTitle from "../common/PageTitle";

class Quotas_Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blocking: false,
      errors: {},
      items: [], // Array of Json Objects
      checkBoxPagante: [],
      checkBoxRecetor: [],
    };

    this.getQuotas = this.getQuotas.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.handleChangeCheckBoxRecetor = this.handleChangeCheckBoxRecetor.bind(
      this
    );
    this.handleChangeCheckBoxPagante = this.handleChangeCheckBoxPagante.bind(
      this
    );
    this.getQuotas();
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
        snapshot.forEach((doc) => {
          console.log(doc.id, "=>", doc.data());
          arrayOfDocs.push(doc.data());
          arrayOfPaganteValues.push(doc.data()["Confirmado Pagante"]);
          arrayOfRecetorValues.push(doc.data()["Confirmado Recetor"]);
        });

        //console.log("Valores: " + JSON.stringify(arrayOfDocs));
        //console.log("Valores: " + JSON.stringify(arrayOfPaganteValues));
        // Save data to state
        this_.setState({
          items: arrayOfDocs,
          checkBoxPagante: arrayOfPaganteValues,
          checkBoxRecetor: arrayOfRecetorValues,
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
      const { Data, Pagante, Recetor, Valor } = item; //destructuring
      var Ano = item["Ano Letivo"];
      var confirmadoRecetor = item["Confirmado Recetor"];
      var confirmadoPagante = item["Confirmado Pagante"];
      const x = id;
      id++;
      return (
        <tr key={id}>
          <td>{Data}</td>
          <td>{Pagante}</td>
          <td>{Recetor}</td>
          <td>{Valor}</td>
          <td>{Ano}</td>
          <td>
            <input
              type="checkbox"
              checked={this.state.checkBoxRecetor[x]}
              disabled={this.state.checkBoxRecetor[x]}
              onChange={this.handleChangeCheckBoxRecetor.bind(this, x)}
            />
          </td>
          <td>
            <input
              type="checkbox"
              checked={this.state.checkBoxPagante[x]}
              disabled={this.state.checkBoxPagante[x]}
              onChange={this.handleChangeCheckBoxPagante.bind(this, x)}
            />
          </td>
        </tr>
      );
    });
  }

  handleChangeCheckBoxRecetor(i) {
    //console.log("função checkBox Recetor " + i);
    //TODO: Confirmar que utilizador a fazer clique é o correto

    if (this.state.checkBoxRecetor[i] == false) {
      if (
        window.confirm("Confirmar ação? Não será possível reverter confirmação")
      ) {
        //User confirmed action
        var array = this.state.checkBoxRecetor;
        array[i] = true;

        this.setState({ checkBoxRecetor: array });
      } else {
        //User canceled, do nothing
      }
    } else {
      //TODO: Retirar este else, não vai dar para reverter confirmação de pagamento
    }
  }

  handleChangeCheckBoxPagante(i) {
    console.log("função checkBox Pagante " + i);
    if (this.state.checkBoxPagante[i] == false) {
      if (
        window.confirm("Confirmar ação? Não será possível reverter confirmação")
      ) {
        //User confirmed action
        var array = this.state.checkBoxPagante;
        array[i] = true;

        this.setState({ checkBoxPagante: array });
      } else {
        //User canceled, do nothing
      }
    } else {
      //TODO: Retirar este else, não vai dar para reverter confirmação de pagamento
    }
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
                <table className="table mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th scope="col" className="border-0">
                        Data
                      </th>
                      <th scope="col" className="border-0">
                        Recetor
                      </th>
                      <th scope="col" className="border-0">
                        Pagante
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
                        Confirmado pelo pagante
                      </th>
                    </tr>
                  </thead>
                  <tbody>{this.renderTableData()}</tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}
export default Quotas_Page;

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
import { Multiselect } from "multiselect-react-dropdown";
import DatePicker from "react-datepicker";
import * as moment from "moment";

class QuotasModal extends React.Component {
  constructor(props) {
    super(props);

    var data = new Date();
    var month = data.getMonth() + 1;
    var year = data.getFullYear();

    var anoLetivoAtual = "";

    if (month >= 7) {
      var first = year;
      var secondTemp = year + 1;
      var second = secondTemp.toString()[2] + secondTemp.toString()[3];
      anoLetivoAtual = first.toString() + "/" + second.toString();
    } else {
      var first = year - 1;
      var second = year.toString()[2] + year.toString()[3];
      anoLetivoAtual = first.toString() + "/" + second.toString();
    }

    this.state = {
      options: [],
      recetor: "",
      emissor: "",
      valor: 5, //default
      anoLetivo: anoLetivoAtual,
      data: new Date(),
    };

    this.saveCota = this.saveCota.bind(this);
    this.onSelectEmissor = this.onSelectEmissor.bind(this);
    this.onSelectRecetor = this.onSelectRecetor.bind(this);
    this.handlechangeValor = this.handlechangeValor.bind(this);
    this.handlechangeAnoLetivo = this.handlechangeAnoLetivo.bind(this);

    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.loadParents = this.loadParents.bind(this);

    this.componentWillMount = this.componentWillMount.bind(this);

    this.loadParents();
  }

  componentWillMount() {
    //Get value of cota defined in parameters
  }

  onSelectEmissor(selectedList, selectedItem) {
    this.setState({ emissor: selectedItem.name });
  }

  onSelectRecetor(selectedList, selectedItem) {
    this.setState({ recetor: selectedItem.name });
  }

  handlechangeValor(e) {
    this.setState({ valor: e.target.value });
  }

  handleChange = (date) => {
    this.setState({
      data: date,
    });
  };

  handlechangeAnoLetivo(e) {
    this.setState({ anoLetivo: e.target.value });
  }

  loadParents() {
    const parentsCollection = firestore.collection("parents");

    var options = [];
    var i = 0;
    parentsCollection.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data()["Nome"] != undefined && doc.data()["Nome"] != null) {
          if (
            doc.data()["Validated"] != undefined &&
            doc.data()["Validated"] != null &&
            doc.data()["Validated"].toString() != "false"
          ) {
            var member = { id: i, name: doc.data()["Nome"] };
            options.push(member);
            i++;
          }
        }
      });
      this.setState({ options: options });
    });
  }

  showModal() {
    this.setState({ show: true });
  }

  closeModal() {
    this.setState({ show: false });
  }

  saveCota() {
    const { recetor, emissor, valor, anoLetivo, data } = this.state;
    const this_ = this;

    var regex = /[0-9]{4}\/[0-9]{2}/;

    if (recetor == "") {
      var message = "Escolha um recetor!";
      toast.configure();
      toast(message, {
        transition: Bounce,
        closeButton: true,
        autoClose: 2000,
        position: "top-right",
        type: "error",
      });
    } else if (emissor == "") {
      var message = "Escolha um emissor!";
      toast.configure();
      toast(message, {
        transition: Bounce,
        closeButton: true,
        autoClose: 2000,
        position: "top-right",
        type: "error",
      });
    } else if (valor == -1 || valor.length == 0) {
      var message = "Escolha um valor!";
      toast.configure();
      toast(message, {
        transition: Bounce,
        closeButton: true,
        autoClose: 2000,
        position: "top-right",
        type: "error",
      });
    } else if (anoLetivo == "" || !regex.test(anoLetivo)) {
      var message = "Ano Letivo em formato incorreto!";
      toast.configure();
      toast(message, {
        transition: Bounce,
        closeButton: true,
        autoClose: 2000,
        position: "top-right",
        type: "error",
      });
    } else {
      var json = {};
      json["Ano Letivo"] = anoLetivo;
      json["Confirmado Pagante"] = false;
      json["Confirmado Recetor"] = false;
      json["Data"] = moment(data).format("DD/MM/YYYY").toString();
      json["Pagante"] = emissor;
      json["Recetor"] = recetor;
      json["Valor"] = valor;
      json["Notas"] = "";
      const ref = firestore.collection("quotas").doc();
      ref
        .set(json)
        .then(function () {
          var message = "Successo!";
          toast.configure();
          toast(message, {
            transition: Bounce,
            closeButton: true,
            autoClose: 2000,
            position: "top-right",
            type: "success",
          });

          this_.setState({
            options: [],
            recetor: "",
            emissor: "",
            valor: -1,
            anoLetivo: "",
            notas: "",
            data: new Date(),
          });
          this_.props.getQuotas();
          this_.closeModal();
        })
        .catch(function (error) {
          var message = "Erro na gravação, tente novamente!";
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

  render() {
    return (
      <>
        <Button
          style={{
            background: "#34b4eb",
            color: "#fff",
            width: "200px",
            textAlign: "center",
            margin: "8px",
          }}
          onClick={this.showModal}
        >
          <i /> Adicionar registo de pagamento
        </Button>

        <Modal show={this.state.show} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Novo Registo Pagamento</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup flush>
              <ListGroupItem className="p-3">
                <Col>
                  <Form>
                    <FormGroup>
                      <label htmlFor="emissor">Emissor</label>
                      <Multiselect
                        options={this.state.options} // Options to display in the dropdown
                        onSelect={this.onSelectEmissor} // Function will trigger on select event
                        displayValue="name" // Property name to display in the dropdown options
                        selectionLimit={1}
                        showCheckbox={false}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label htmlFor="recetor">Recetor</label>
                      <Multiselect
                        options={this.state.options} // Options to display in the dropdown
                        onSelect={this.onSelectRecetor} // Function will trigger on select event
                        displayValue="name" // Property name to display in the dropdown options
                        selectionLimit={1}
                        showCheckbox={false}
                      />
                    </FormGroup>

                    <FormGroup>
                      <label htmlFor="valor">Valor (euros)</label>
                      <FormInput
                        id="valor"
                        type="number"
                        onChange={this.handlechangeValor}
                        value={this.state.valor}
                      ></FormInput>
                    </FormGroup>
                    <FormGroup>
                      <label htmlFor="anoLetivo">
                        Ano Letivo (Exemplo formato: 2019/20)
                      </label>
                      <FormInput
                        id="valor"
                        type="text"
                        onChange={this.handlechangeAnoLetivo}
                        value={this.state.anoLetivo}
                      ></FormInput>
                    </FormGroup>
                    <FormGroup>
                      <label htmlFor="anoLetivo" style={{ margin: "8px" }}>
                        Data:{" "}
                      </label>
                      {""}
                      <DatePicker
                        className="form-control"
                        showPopperArrow={true}
                        selected={this.state.data}
                        onChange={this.handleChange}
                        dateFormat="dd/MM/yyyy"
                      />
                    </FormGroup>
                  </Form>
                </Col>
              </ListGroupItem>
            </ListGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>
              Fechar
            </Button>
            <Button variant="primary" onClick={this.saveCota}>
              Gravar
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default QuotasModal;

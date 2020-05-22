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

import { firestore, firebase_auth, firebase } from "../../firebase-config";
import PageTitle from "../common/PageTitle";

class Cargos_Page extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: null,

      blocking: false,
      errors: {},
      nome: null,
      admin: null,
    };

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
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

  render() {
    return (
      <Container fluid className="main-content-container px-4">
        {/* Default Light Table */}
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">Transições de Cargos</h6>
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
                        Nome
                      </th>
                      <th scope="col" className="border-0">
                        Novo Cargo
                      </th>
                      <th scope="col" className="border-0">
                        Aceite?
                      </th>
                      <th scope="col" className="border-0">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {this.state.redirect}
      </Container>
    );
  }
}
export default Cargos_Page;

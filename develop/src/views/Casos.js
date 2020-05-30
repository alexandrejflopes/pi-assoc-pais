/* eslint jsx-a11y/anchor-is-valid: 0 */

// suporte para o jQuery
/*eslint-env jquery*/

import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Button,
  FormCheckbox,
} from "shards-react";
import { Link, Redirect } from "react-router-dom";

import PageTitle from "../components/common/PageTitle";
import {
  initCasosExemplo,
  showAvailableCasos,
} from "../firebase_scripts/casos";
import CasosModal from "../components/casos/CasosModal";

import {
  languageCode,
  seeMoreButton,
  showArquivedCases,
  casesLoading,
} from "../utils/general_utils";
var dateFormat = require("dateformat");

class Casos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // casos para serem substituídos pelos do Firebase
      CasosFireBase: [
        {
          id: 1,
          autor: "John James",
          autorAvatar: require("../images/avatars/1.jpg"),
          titulo: "Água a entrar na sala 12",
          descricao:
            "In said to of poor full be post face snug. Introduced imprudence see say unpleasing devonshire acceptance son. Exeter longer wisdom work...",
          data: "29 February 2019",
        },
      ],

      AddingNewCaso: false,

      Updated: false,
      // Third list of posts.
      ListaCasosArquivados: [
        {
          id: 1,
          autor: "John James",
          autorAvatar: require("../images/avatars/1.jpg"),
          titulo: "Água a entrar na sala 12",
          descricao:
            "In said to of poor full be post face snug. Introduced imprudence see say unpleasing devonshire acceptance son. Exeter longer wisdom work...",
          data: "29 February 2019",
        },
        {
          id: 2,
          autor: "John James",
          autorAvatar: require("../images/avatars/2.jpg"),
          titulo: "Husbands ask repeated resolved but laughter debating",
          descricao:
            "It abode words began enjoy years no do ﻿no. Tried spoil as heart visit blush or. Boy possible blessing sensible set but margaret interest. Off tears...",
          data: "29 February 2019",
        },
        {
          id: 3,
          autor: "John James",
          autorAvatar: require("../images/avatars/3.jpg"),
          titulo:
            "Instantly gentleman contained belonging exquisite now direction",
          descricao:
            "West room at sent if year. Numerous indulged distance old law you. Total state as merit court green decay he. Steepest merit checking railway...",
          data: "29 February 2019",
        },
      ],
      casoDetail: null,
      redirect: null,
      ListaCasosNaoArquivados: [],
      showCasosArquivados: false,
    };

    this.closeCasoDetails = this.closeCasoDetails.bind(this);
    this.showCasoDetails = this.showCasoDetails.bind(this);
    this.handleChangeCheckBox = this.handleChangeCheckBox.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    //initCasosExemplo();
    const this_ = this;

    var currentUser = JSON.parse(window.localStorage.getItem("userDoc"));
    if (currentUser != null) {
      const casosPromise = showAvailableCasos();

      casosPromise.then((result) => {
        var arquivedCases = [];
        var nonArquivedCases = [];
        if (result != null) {
          for (var i = 0; i < result.length; i++) {
            var case_selected = result[i];
            if (case_selected.arquivado == false) {
              nonArquivedCases.push(case_selected);
            } else {
              arquivedCases.push(case_selected);
            }
          }
        }

        this_.setState({
          ListaCasosArquivados: arquivedCases,
          ListaCasosNaoArquivados: nonArquivedCases,
          Updated: true,
        });
      });
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

  handleChangeCheckBox() {
    let { showCasosArquivados } = this.state;
    var newValue = false;
    if (showCasosArquivados) {
      newValue = false;
    } else {
      newValue = true;
    }

    this.setState({ showCasosArquivados: newValue });
  }

  closeCasoDetails() {
    this.setState({ casoDetail: null });
  }

  showCasoDetails(e) {
    const id = e.target.id;
    const this_ = this;
    var red = null;

    for (var i = 0; i < this.state.ListaCasosArquivados.length; i++) {
      if (
        this.state.ListaCasosArquivados[i].id != undefined &&
        this.state.ListaCasosArquivados[i].id == id
      ) {
        var caso = this.state.ListaCasosArquivados[i];

        red = (
          <Redirect
            to={{
              pathname: "/caso/" + id,
              state: { caso: caso },
            }}
          />
        );

        this.setState({ redirect: red });
      }
    }

    if (red == null) {
      for (var i = 0; i < this.state.ListaCasosNaoArquivados.length; i++) {
        if (
          this.state.ListaCasosNaoArquivados[i].id != undefined &&
          this.state.ListaCasosNaoArquivados[i].id == id
        ) {
          var caso = this.state.ListaCasosNaoArquivados[i];

          red = (
            <Redirect
              to={{
                pathname: "/caso/" + id,
                state: { caso: caso },
              }}
            />
          );

          this.setState({ redirect: red });
        }
      }
    }
  }

  render() {
    const {
      ListaCasosArquivados,
      ListaCasosNaoArquivados,
      showCasosArquivados,
    } = this.state;

    if (this.state.Updated) {
      return (
        <Container fluid className="main-content-container px-4">
          {/* Page Header */}
          <Row noGutters className="page-header py-4">
            <PageTitle sm="4" title="Casos" className="text-sm-left" />
          </Row>

          <Row
            noGutters
            className="page-header"
            style={{ marginTop: "10px", marginBottom: "20px" }}
          >
            <CasosModal componentDidMount={this.componentDidMount} />
          </Row>

          <Row
            noGutters
            className="page-header"
            style={{ marginTop: "10px", marginBottom: "20px" }}
          >
            <FormCheckbox
              id="showCasosPrivados"
              checked={this.state.showCasosArquivados}
              onChange={this.handleChangeCheckBox}
            >
              {showArquivedCases[languageCode]}
            </FormCheckbox>
          </Row>

          {/* First Row of Cases */}
          <Row>
            {ListaCasosNaoArquivados != null
              ? ListaCasosNaoArquivados.map((post, idx) => (
                  <Col lg="4" key={idx}>
                    <Card small className="card-post mb-4">
                      <CardBody>
                        <h5 className="card-title">{post.titulo}</h5>
                        <p
                          className="card-text text-muted"
                          style={{
                            whiteSpace: "nowrap",
                            width: "inherit",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {post.descricao}
                        </p>
                      </CardBody>
                      <CardFooter className="border-top d-flex">
                        <div className="card-post__author d-flex">
                          <img
                            className="card-post__author-avatar card-post__author-avatar--small"
                            src={
                              post.autor.photo
                                ? post.autor.photo
                                : "https://www.gravatar.com/avatar/2c5fa499f927cb256c8da6bc60fb7937?d=mp"
                            }
                          ></img>
                          <div className="d-flex flex-column justify-content-center ml-3">
                            <span className="card-post__author-name">
                              {post.autor.nome}
                            </span>
                            <small className="text-muted">
                              {" "}
                              {post.data_criacao
                                ? dateFormat(
                                    new Date(post.data_criacao._seconds * 1000),
                                    "dd-mm-yyyy, h:MM:ss TT"
                                  )
                                : "-"}
                            </small>
                          </div>
                        </div>
                        <div className="my-auto ml-auto">
                          <Button
                            size="sm"
                            theme="primary"
                            id={`${post.id}`}
                            onClick={this.showCasoDetails}
                          >
                            <i className="fa fa-search mr-1" />{" "}
                            {seeMoreButton[languageCode]}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                    {this.state.redirect}
                  </Col>
                ))
              : ""}
            {ListaCasosArquivados != null && showCasosArquivados
              ? ListaCasosArquivados.map((post, idx) => (
                  <Col lg="4" key={idx}>
                    <Card small className="card-post mb-4">
                      <CardBody>
                        <h5 className="card-title">{post.titulo}</h5>
                        <p
                          className="card-text text-muted"
                          style={{
                            whiteSpace: "nowrap",
                            width: "inherit",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {post.descricao}
                        </p>
                      </CardBody>
                      <CardFooter className="border-top d-flex">
                        <div className="card-post__author d-flex">
                          <img
                            className="card-post__author-avatar card-post__author-avatar--small"
                            src={
                              post.autor.photo
                                ? post.autor.photo
                                : "https://www.gravatar.com/avatar/2c5fa499f927cb256c8da6bc60fb7937?d=mp"
                            }
                          ></img>
                          <div className="d-flex flex-column justify-content-center ml-3">
                            <span className="card-post__author-name">
                              {post.autor.nome}
                            </span>
                            <small className="text-muted">
                              {" "}
                              {post.data_criacao
                                ? dateFormat(
                                    new Date(post.data_criacao._seconds * 1000),
                                    "dd-mm-yyyy, h:MM:ss TT"
                                  )
                                : "-"}
                            </small>
                          </div>
                        </div>
                        <div className="my-auto ml-auto">
                          <Button
                            size="sm"
                            theme="primary"
                            id={`${post.id}`}
                            onClick={this.showCasoDetails}
                          >
                            <i className="fa fa-search mr-1" />{" "}
                            {seeMoreButton[languageCode]}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </Col>
                ))
              : ""}
          </Row>

          {this.state.casoDetail}
        </Container>
      );
    } else {
      return (
        <Container fluid className="main-content-container px-4">
          {/* Page Header */}
          <Row noGutters className="page-header py-4">
            <PageTitle sm="4" title="Casos" className="text-sm-left" />
          </Row>

          <Row
            fluid
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <h2>{casesLoading[languageCode]}</h2>
          </Row>
          {this.state.redirect}
        </Container>
      );
    }
  }
}

export default Casos;

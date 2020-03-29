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
  Button
} from "shards-react";

import PageTitle from "../components/common/PageTitle";
import {initCasosExemplo, showAvailableCasos} from "../firebase_scripts/setupCasos";

class Casos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      // casos para serem substituídos pelos do Firebase
      CasosFireBase: [
        {
          id : 1,
          autor: "John James",
          autorAvatar: require("../images/avatars/1.jpg"),
          titulo: "Água a entrar na sala 12",
          descricao:
            "In said to of poor full be post face snug. Introduced imprudence see say unpleasing devonshire acceptance son. Exeter longer wisdom work...",
          data: "29 February 2019"
        }
      ],

      Updated : false,
      // Third list of posts.
      ListaCasos: [
        {
          id : 1,
          autor: "John James",
          autorAvatar: require("../images/avatars/1.jpg"),
          titulo: "Água a entrar na sala 12",
          descricao:
            "In said to of poor full be post face snug. Introduced imprudence see say unpleasing devonshire acceptance son. Exeter longer wisdom work...",
          data: "29 February 2019"
        },
        {
          id : 2,
          autor: "John James",
          autorAvatar: require("../images/avatars/2.jpg"),
          titulo: "Husbands ask repeated resolved but laughter debating",
          descricao:
            "It abode words began enjoy years no do ﻿no. Tried spoil as heart visit blush or. Boy possible blessing sensible set but margaret interest. Off tears...",
          data: "29 February 2019"
        },
        {
          id : 3,
          autor: "John James",
          autorAvatar: require("../images/avatars/3.jpg"),
          titulo:
            "Instantly gentleman contained belonging exquisite now direction",
          descricao:
            "West room at sent if year. Numerous indulged distance old law you. Total state as merit court green decay he. Steepest merit checking railway...",
          data: "29 February 2019"
        }
      ]

    };
  }


  componentDidMount() {
    // <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    initCasosExemplo();
    const self = this;

    const casosPromise = showAvailableCasos();

    casosPromise.then(result => {
      self.setState({ ListaCasos: result , Updated : true});
    })

    console.log("state -> ", self.state);
  }

  render() {

    console.log("state no render -> ", this.state);
    const {
      ListaCasos,
    } = this.state;


    if(this.state.Updated){
      return (
        <Container fluid className="main-content-container px-4">
          {/* Page Header */}
          <Row noGutters className="page-header py-4">
            <PageTitle sm="4" title="Casos" className="text-sm-left" />
          </Row>

          {/* First Row of Issues */}
          <Row>
            {ListaCasos.map((post, idx) => (
              <Col lg="4" key={idx}>
                <Card small className="card-post mb-4">
                  <CardBody>
                    <h5 className="card-title">{post.titulo}</h5>
                    <p className="card-text text-muted" style={{whiteSpace: "nowrap",
                      width: "inherit",
                      overflow: "hidden",
                      textOverflow: "ellipsis"}}>{post.descricao}</p>
                  </CardBody>
                  <CardFooter className="border-top d-flex">
                    <div className="card-post__author d-flex">
                      <a
                        href="#"
                        className="card-post__author-avatar card-post__author-avatar--small"
                        style={{ backgroundImage: `url('https://i.pravatar.cc/128')` }}
                      >
                        Written by James Khan
                      </a>
                      <div className="d-flex flex-column justify-content-center ml-3">
                      <span className="card-post__author-name">
                        {post.autor.nome}
                      </span>
                        <small className="text-muted">29 março 2020</small>
                      </div>
                    </div>
                    <div className="my-auto ml-auto">
                      <Button size="sm" theme="primary" id={`'${post.id}'`}>
                        <i className="fa fa-search mr-1" /> Ver mais
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </Col>
            ))}
          </Row>

        </Container>
      );
    }
    else{
      return (
        <Container fluid className="main-content-container px-4">
          {/* Page Header */}
          <Row noGutters className="page-header py-4">
            <PageTitle sm="4" title="Casos" className="text-sm-left" />
          </Row>

          <Row fluid
               style={{
                 display: "flex",
                 justifyContent: "center",
                 alignContent: "center",
                 alignItems: "center",
                 position: "absolute",
                 left: "50%",
                 top: "50%",
                 transform: "translate(-50%, -50%)"
               }}>
            <h2>A obter casos...</h2>
          </Row>

        </Container>
      );
    }
  }
}

export default Casos;

import React from "react";
import { Container, Row, Col, CardHeader, Card } from "shards-react";
import { Link, Redirect } from "react-router-dom";

import PageTitle from "../components/common/PageTitle";

import Cargos_Page from "../components/cargos-page/CargosPage";
import CargosModal from "../components/cargos-page/CargosModal";

const CargosPage = (e) => (
  <Container fluid className="main-content-container px-4 pb-4">
    <Row noGutters className="page-header py-4">
      <PageTitle sm="4" title="Cargos" className="text-sm-left" />
    </Row>
    <Row
      noGutters
      className="page-header"
      style={{ marginTop: "10px", marginBottom: "20px" }}
    >
      <CargosModal />
    </Row>
    <Row
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "20px",
        marginRight: "0px",
      }}
    >
      {/* Form */}
      <Col lg="9" md="12">
        <Cargos_Page />
      </Col>
    </Row>
  </Container>
);

export default CargosPage;

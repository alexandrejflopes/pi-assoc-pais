import React from "react";
import { Container, Row, Col, CardHeader, Card } from "shards-react";
import { Link, Redirect } from "react-router-dom";

import PageTitle from "../components/common/PageTitle";

import Quotas_Page from "../components/quotas-page/QuotasPage";

const QuotasPage = (e) => (
  <Container fluid className="main-content-container px-4 pb-4">
    <Row noGutters className="page-header py-4">
      <PageTitle sm="4" title="Quotas" className="text-sm-left" />
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
        <Quotas_Page
          email={
            e.history.location.state
              ? e.history.location.state.Email
              : window.localStorage.getItem("email")
              ? window.localStorage.getItem("email")
              : null
          }
        />
      </Col>
    </Row>
  </Container>
);

export default QuotasPage;

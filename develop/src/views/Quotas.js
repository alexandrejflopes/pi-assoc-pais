import React from "react";
import { Container, Row, Col, CardHeader, Card } from "shards-react";

import Quotas_Page from "../components/quotas-page/QuotasPage";

const QuotasPage = (e) => (
  <Container fluid className="main-content-container px-4 pb-4">
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
        {/*<Card small>
          <CardHeader className="border-bottom">
            <h6 className="m-0">Quotas</h6>
          </CardHeader></Card>*/}
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

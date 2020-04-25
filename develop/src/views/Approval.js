import React from "react";
import { Container, Row, Col, CardHeader, Card } from "shards-react";

import Approval_Page from "../components/approval-page/ApprovalPage";

const ApprovalPage = () => (
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
        <Card small>
          <CardHeader className="border-bottom">
            <h6 className="m-0">Pedidos de Registo</h6>
          </CardHeader>
          <Approval_Page />
        </Card>
      </Col>
    </Row>
  </Container>
);

export default ApprovalPage;

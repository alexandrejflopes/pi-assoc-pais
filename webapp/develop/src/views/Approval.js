import React from "react";
import { Container, Row, Col, CardHeader, Card } from "shards-react";

import PageTitle from "../components/common/PageTitle";

import Approval_Page from "../components/approval-page/ApprovalPage";
import Approval_Page_Paga from "../components/approval-page/ApprovalPagePaga";

const ApprovalPage = () => (
  <Container fluid className="main-content-container px-4 pb-4">
    <Row noGutters className="page-header py-4">
      <PageTitle sm="4" title="Pedidos" className="text-sm-left" />
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
      <Col
        lg="9"
        md="12"
        style={{
          margin: "8px",
        }}
      >
        <Card small>
          <CardHeader className="border-bottom">
            <h6 className="m-0">Pedidos de Registo (Quota Paga)</h6>
          </CardHeader>
          <Approval_Page_Paga />
        </Card>
      </Col>

      <Col lg="9" md="12">
        <Card small>
          <CardHeader className="border-bottom">
            <h6 className="m-0">Pedidos de Registo (Sem Quota Paga)</h6>
          </CardHeader>
          <Approval_Page />
        </Card>
      </Col>
    </Row>
  </Container>
);

export default ApprovalPage;

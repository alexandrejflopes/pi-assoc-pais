import React from "react";
import { Container, Row, Col, CardHeader, Card } from "shards-react";

import Payment_Page from "../components/payment-page/PaymentPage";

const PaymentPage = (e) => (
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
            <h6 className="m-0">Pagamento</h6>
          </CardHeader>
          <Payment_Page
            email={
              e.history.location.state ? e.history.location.state.Email : null
            }
            payment={
              e.history.location.state
                ? e.history.location.state.payment
                : false
            }
          />
        </Card>
      </Col>
    </Row>
  </Container>
);

export default PaymentPage;

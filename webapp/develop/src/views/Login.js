import React from "react";
import { Container, Row, Col, CardHeader, Card } from "shards-react";

import Login_Page from "../components/login-page/LoginPage";

const LoginPage = (e) => (
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
            <h6 className="m-0">Login</h6>
          </CardHeader>
          <Login_Page
            msg={
              e.history.location.state
                ? e.history.location.state.msg
                : undefined
            }
          />
        </Card>
      </Col>
    </Row>
  </Container>
);

export default LoginPage;

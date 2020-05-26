import React from "react";
import {Container, Row, Col, CardHeader, Card} from "shards-react";

import ConfigForm from "../components/config-inicial/ConfigForm";


const AssocConfiguration = () => (

  <Container fluid className="main-content-container px-4 pb-4">



    <Row style={{display:"flex" , justifyContent:"center", marginTop:"20px", marginRight:"0px"}}>
      {/* Form */}
      <Col lg="12" md="12" sm="12">
        <Card small>
          <CardHeader className="border-bottom">
            <h6 className="m-0">Configuração</h6>
          </CardHeader>
          <ConfigForm />
        </Card>
      </Col>

    </Row>
  </Container>
);

export default AssocConfiguration;

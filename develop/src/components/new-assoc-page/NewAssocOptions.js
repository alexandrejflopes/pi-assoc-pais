import React, { Component, Fragment } from "react";
import {
  Button,
  Col,
  Form, FormCheckbox, FormFeedback,
  FormGroup,
  FormInput, FormTextarea,
  //ListGroup,
  //ListGroupItem,
  Row
} from "shards-react";

import BlockUi from "react-block-ui";
import {Loader} from "react-loaders";
import ListGroup from "react-bootstrap/ListGroup";


function alertClicked(itemID) {
  if(itemID==="nova"){
    alert("criar nova")
  }
  else if(itemID==="existente"){
    alert("criar existente")
  }

}

function redirecToConfig() {
  window.location = "/assoc-config";
}

function redirecToConfigNew() {
  window.location = "/new-assoc-config";
}



const NewAssocOptions = () => (


  <>

    <div className="h-100 bg-animation">
      <div
        className="d-flex h-100 justify-content-center align-items-center"
      >
        <Col className="col-md-9 col-lg-9">
          <div

          >
            <div className="modal-body" style={{ border: "none" }}>
              <div className="col-md-12" >
                <Col className="col-md-12 col-lg-12 col-sm-12" style={{ textAlign: "center" }}>
                  <ListGroup flush className="col-md-12 col-lg-12 col-sm-12" style={{ textAlign: "center" }}>
                    <ListGroup.Item className="p-3" action onClick={redirecToConfigNew}>
                      <h3>
                        Nova Associação
                      </h3>
                      <p>
                        Associação não formalaziada fisicamente e ainda sem associados para importar para a plataforma
                      </p>
                    </ListGroup.Item>
                  </ListGroup>
                  <hr/>
                  <ListGroup flush className="col-md-12 col-lg-12 col-sm-12" style={{ textAlign: "center" }}>

                    <ListGroup.Item className="p-3" action onClick={redirecToConfig}>
                      <h3>
                        Associação existente
                      </h3>
                      <p>
                        Associação já formalizada e a operar na escola fisicamente, com dados de associados e educandos para importar para a plataforma
                      </p>
                    </ListGroup.Item>

                  </ListGroup>
                </Col>
              </div>
            </div>
          </div>

        </Col>
      </div>
    </div>




  </>

);

export default NewAssocOptions;

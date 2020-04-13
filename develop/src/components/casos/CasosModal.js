/* eslint jsx-a11y/anchor-is-valid: 0 */

import React, {Fragment, useState} from "react";
import ReactDOM from 'react-dom';
import Modal from 'react-bootstrap/Modal'
import {
  ListGroup,
  ListGroupItem,
  Button,
  Col,
  Form,
  FormGroup,
  FormInput,
  FormFeedback,
  FormTextarea,
  FormCheckbox
} from "shards-react";



/*class CasosModal extends React.Component {

  constructor(props) {
    super(props);
    const [show, setShow] = useState(false);
    this.state = {
      ListaMembros : [],

    };
  }

  handleClose(){
    this.setShow(false);
  }
  handleClose = () => setShow(false);
  handleShow = () => setShow(true);



  addMembroFragment(){

  }

}*/

function CasosModal() {

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return(
    <>
      <Button size="md" theme="primary" id="new_case" onClick={handleShow}>
        <i className="fa fa-plus mr-1" /> Abrir um novo caso
      </Button>


      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Novo caso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup flush>
            <ListGroupItem className="p-3">
              <Col>
                <Form>
                  <FormGroup>
                    <label htmlFor="configAssocName">Título do caso</label>
                    <FormInput
                      id="novoCasoTitulo"
                      type="text"
                      placeholder="Breve título do situação que origina o caso."
                      required
                    />
                    <FormFeedback id="novoCasoTituloFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                  </FormGroup>

                  {/* Descricao Textarea */}
                  <FormGroup>
                    <label htmlFor="novoCasoDescricao">Descrição (opcional)</label>
                    <FormTextarea id="novoCasoDescricao" placeholder="Descrição breve da situação que origina o caso." />
                    <FormFeedback id="novoCasoDescricaoFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                  </FormGroup>

                  <FormGroup>
                    <FormCheckbox id="novoCasoPrivadoCheckbox" >
                      {/* eslint-disable-next-line */}Este caso é privado.
                    </FormCheckbox>
                  </FormGroup>

                  <ListGroup id="listaMembros">
                    <h5>
                      Membros
                    </h5>

                    <Fragment>
                      <FormGroup>
                        <label htmlFor="novoCasoMembroEmail1">Email</label>
                        <FormInput
                          id="novoCasoMembroEmail1"
                          type="email"
                          placeholder="socio@exemplo.pt"
                          required
                        />
                      </FormGroup>
                    </Fragment>
                  </ListGroup>

                  <Button>
                    Adicionar mais um membro
                  </Button>
                </Form>
              </Col>

            </ListGroupItem>
          </ListGroup>
        </Modal.Body>


        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Abrir caso
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}


export default CasosModal;

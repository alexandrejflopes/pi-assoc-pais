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


class CasosModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      membrosList : [
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
      ],
      numMembros : 1,
      show : false,
      checkBoxStatus: false
    };

    this.addMember = this.addMember.bind(this);
    this.handleChangeCheckBox = this.handleChangeCheckBox.bind(this);
    this.hideMembersFragment = this.closeModal.bind(this);
    this.showMembersFragment = this.closeModal.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }



  showModal(){
    this.setState({show:true});
  }

  closeModal(){
    this.setState({show:false});
  }

  handleChangeCheckBox(){
    let { checkBoxStatus } = this.state;
    checkBoxStatus = !checkBoxStatus;

    if(checkBoxStatus)
      this.showMembersFragment();
    else
      this.hideMembersFragment();

    this.setState({ checkBoxStatus: checkBoxStatus });
  }


  hideMembersFragment(){
    this.setState({membrosList : []})
  }

  showMembersFragment(){
    this.setState({membrosList : [
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
      ]})
  }


  addMember() {

    const novoNumMembros = this.state.membrosList.length + 1;
    const novoId = "novoCasoMembroEmail"+novoNumMembros;

    let membrosAtuais =  this.state.membrosList;

    console.log("membros atuais antes -> " + membrosAtuais);

    let add =
      <Fragment>
        <FormGroup>
          <label htmlFor={novoId}>Email</label>
          <FormInput
            id={novoId}
            type="email"
            placeholder="socio@exemplo.pt"
            required
          />
        </FormGroup>
      </Fragment>
    ;

    console.log("add -> ", add);

    membrosAtuais.push(add);

    console.log("membros atuais depois -> " + membrosAtuais);

    this.setState({
      membrosList : membrosAtuais,
      numMembros : novoNumMembros
    })


  }





  render() {
    console.log("começar render");
    console.log("state a render -> " + JSON.stringify(this.state));
    return (
      <>
        <Button size="md" theme="primary" id="new_case" onClick={this.showModal}>
          <i className="fa fa-plus mr-1" /> Abrir um novo caso
        </Button>

        <Modal show={this.state.show} onHide={this.closeModal}>
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
                      <FormCheckbox id="novoCasoPrivadoCheckbox" checked={this.state.checkBoxStatus} onChange={this.handleChangeCheckBox}>
                        {/* eslint-disable-next-line */}Este caso é privado.
                      </FormCheckbox>
                    </FormGroup>

                    <ListGroup id="listaMembros">
                      <h5>
                        Membros
                      </h5>

                      {this.state.membrosList}

                      <Button onClick={this.addMember}>
                        Adicionar mais um membro
                      </Button>
                    </ListGroup>

                  </Form>
                </Col>

              </ListGroupItem>
            </ListGroup>
          </Modal.Body>


          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>
              Fechar
            </Button>
            <Button variant="primary" onClick={this.closeModal}>
              Criar caso
            </Button>
          </Modal.Footer>
        </Modal>


      </>
    );
  }
}


export default CasosModal;

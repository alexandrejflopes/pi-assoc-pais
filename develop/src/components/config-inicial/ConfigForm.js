import React, {Component} from "react";
import {
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Form,
  FormInput,
  FormGroup,
  FormCheckbox,
  Button, FormTextarea, FormFeedback, Tooltip
} from "shards-react";


import AssocLogoUpload from "./AssocLogoUpload";
import MembersFileUpload from "./MembersFileUpload";
import NewParamsFileUpload from "./NewParamsFileUpload";
import {install} from "../../firebase_scripts/installation";
import StudentsFileUpload from "./StudentsFileUpload";
import {languageCode} from "../../utils/general_utils";
import {membersImportFileFormatsTipMessage, studentsImportFileFormatsTipMessage, paramsJsonFileTipMessage, assocLogoFormatsTipMessage} from "../../utils/messages_strings";

class ConfigForm extends Component {

  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      about: false,
      logo: false,
      members: false,
      students: false,
      jsonParams: false
    };
  }

  toggle(pos) {
    const newState = {};
    newState[pos] = !this.state[pos];
    this.setState({ ...this.state, ...newState });
  }

  render() {
    return (
      <ListGroup flush>
        <ListGroupItem className="p-3">
          <Col>
            <Form>
              <FormGroup>
                <label htmlFor="configAssocName">Nome da Associação de Pais</label>
                <FormInput
                  id="configAssocName"
                  type="text"
                  placeholder="Associação de Pais e Encarregados de Educação da Escola..."
                  required
                />
                <FormFeedback id="configAssocNameFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
              </FormGroup>

              {/* Descricao Textarea */}
              <FormGroup>
                <label htmlFor="configAssocDescricao">Descrição (opcional)</label>
                <FormTextarea id="configAssocDescricao" placeholder="Descrição breve da associação e/ou alguns objetivos." />
                <FormFeedback id="configAssocDescricaoFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
              </FormGroup>

              <FormGroup>
                <label htmlFor="configAssocAddress">Morada (sede/escola)</label>
                <FormInput id="configAssocAddress" placeholder="Rua Dr. Ricardo Silva, 276 R/C Dto" />
                <FormFeedback id="configAssocAddressFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
              </FormGroup>

              <Row form>
                <Col md="6" className="form-group">
                  <label htmlFor="configAssocLocalidade">Localidade</label>
                  <FormInput id="configAssocLocalidade" />
                  <FormFeedback id="configAssocLocalidadeFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                </Col>
                <Col md="6" className="form-group">
                  <label htmlFor="configAssocZip">Código Postal</label>
                  <FormInput id="configAssocZip" />
                  <FormFeedback id="configAssocZipFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                </Col>
              </Row>
              <hr />

              {/* Contactos */}
              <Row form>
                <Col md="6">
                  <FormGroup>
                    <label htmlFor="configAssocEmail">Email da Associação</label>
                    <FormInput
                      id="configAssocEmail"
                      type="email"
                      placeholder="associacao@exemplo.pt"
                      required
                    />
                  </FormGroup>
                  <FormFeedback id="configAssocEmailFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label htmlFor="configAssocPhone">Telemóvel / Telefone (opcional)</label>
                    <FormInput
                      id="configAssocPhone"
                      type="tel"
                      placeholder="200345678"
                    />
                    <FormFeedback id="configAssocPhoneFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                  </FormGroup>

                </Col>
              </Row>

              <Row form>
                <Col md="12">
                  <FormGroup>
                    <label htmlFor="configAssocIBAN">IBAN (opcional)</label>
                    <FormInput id="configAssocIBAN" placeholder="PT50 1234 4321 12345678901 72"/>
                    <FormFeedback id="configAssocIBANFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                  </FormGroup>

                </Col>
              </Row>


            </Form>
          </Col>

        </ListGroupItem>

        <ListGroupItem className="p-3">
          <Col>
            <Form>
              <Row form>
                <Col md="6">
                  <FormGroup>
                    <label htmlFor="configAssocLogo">Logótipo da associação/escola (opcional) <span id="logoTooltip" className="material-icons" style={{fontSize:"100%"}}>info</span></label>
                    <Tooltip
                      open={this.state.logo}
                      target="#logoTooltip"
                      toggle={() => this.toggle("logo")}
                      style={{fontSize:"120%"}}
                    >
                      {assocLogoFormatsTipMessage[languageCode]}
                    </Tooltip>
                    <AssocLogoUpload/>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label htmlFor="configAssocMembers">Membros da Associação <span id="membersTooltip" className="material-icons" style={{fontSize:"100%"}}>info</span></label>
                    <Tooltip
                      open={this.state.members}
                      target="#membersTooltip"
                      toggle={() => this.toggle("members")}
                      style={{fontSize:"120%"}}
                    >
                      {membersImportFileFormatsTipMessage[languageCode]}
                    </Tooltip>
                    <MembersFileUpload/>
                  </FormGroup>
                </Col>
              </Row>

              <Row form>
                <Col md="6">
                  <FormGroup>
                    <label htmlFor="configAssocStudents">Alunos e Encarregados de Educação <span id="studentsTooltip" className="material-icons" style={{fontSize:"100%"}}>info</span></label>
                    <Tooltip
                      open={this.state.students}
                      target="#studentsTooltip"
                      toggle={() => this.toggle("students")}
                      style={{fontSize:"120%"}}
                    >
                      {studentsImportFileFormatsTipMessage[languageCode]}
                    </Tooltip>
                    <StudentsFileUpload />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label htmlFor="configAssocNewParams">Parâmetros particulares do contexto da Associação <span id="jsonParamsTooltip" className="material-icons" style={{fontSize:"100%"}}>info</span></label>
                    <Tooltip
                      open={this.state.jsonParams}
                      target="#jsonParamsTooltip"
                      toggle={() => this.toggle("jsonParams")}
                      style={{fontSize:"120%"}}
                    >
                      {paramsJsonFileTipMessage[languageCode]}
                    </Tooltip>
                    <NewParamsFileUpload />
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </Col>
        </ListGroupItem>


        <ListGroupItem className="p-3">
          <Col>
            <Form>
              <Row form>
                <Col md="6" className="form-group">
                  <FormGroup>
                    <FormCheckbox id="policyCheckbox">
                      {/* eslint-disable-next-line */}Li e aceito a{" "}
                      <a href="#">Política de Privacidade</a>.
                    </FormCheckbox>
                    <FormFeedback id="policyCheckboxFeedback" valid={false} style={{display:"none"}}>Para instalar o software, precisa de aceitar a Política de Privacidade</FormFeedback>
                  </FormGroup>
                  <Button onClick={install}>Instalar</Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </ListGroupItem>
      </ListGroup>
    );
  }

}



export default ConfigForm;

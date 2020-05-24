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
import NewParamsFileUpload from "./NewParamsFileUpload";
import {install} from "../../firebase_scripts/installation_new_assoc";
import {assocParameters, languageCode} from "../../utils/general_utils";
import {
  aboutYouTipMessage,
  paramsJsonFileTipMessage,
  assocLogoFormatsTipMessage,
  cargosFileTipMessage
} from "../../utils/messages_strings";
import CargosFileUpload from "./CargosFileUpload";

class ConfigFormNew extends Component {

  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      about: false,
      logo: false,
      jsonParams: false,
      cargosFile : false
    };
  }

  toggle(pos) {
    const newState = {};
    newState[pos] = !this.state[pos];
    this.setState({ ...this.state, ...newState });
  }

  render() {
    return(
      <ListGroup flush>
        <ListGroupItem className="p-3">
          <Col>
            <Form>
              <Row>
                <Col md="2">
                  <h5 >Sobre si <span id="aboutYouTooltip" className="material-icons" style={{fontSize:"100%"}}>info</span></h5>
                  <Tooltip
                    open={this.state.about}
                    target="#aboutYouTooltip"
                    toggle={() => this.toggle("about")}
                    style={{fontSize:"120%"}}
                  >
                    {aboutYouTipMessage[languageCode]}
                  </Tooltip>
                </Col>
              </Row>
              <Row form>
                <Col md="4" className="form-group">
                  <label htmlFor="configAssocAdminNome">O seu nome</label>
                  <FormInput id="configAssocAdminNome" type="text" placeholder="João Oliveira" required />
                  <FormFeedback id="configAssocAdminNomeFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                </Col>
                <Col md="4">
                  <FormGroup>
                    <label htmlFor="configAdminEmail">O seu email</label>
                    <FormInput
                      id="configAdminEmail"
                      type="email"
                      placeholder="joao@associacao.pt"
                      required
                    />
                  </FormGroup>
                  <FormFeedback id="configAdminEmailFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                </Col>
                <Col md="4" className="form-group">
                  <label htmlFor="configAssocAdminCargo">Cargo</label>
                  <FormInput
                    id="configAssocAdminCargo"
                    type="text"
                    placeholder="Cargo a desempenhar na associação"
                    required />
                  <FormFeedback id="configAssocAdminCargoFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                </Col>
              </Row>
              <hr />
              <h5>A Associação</h5>
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
                  <FormInput id="configAssocLocalidade" placeholder="Aveiro" />
                  <FormFeedback id="configAssocLocalidadeFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                </Col>
                <Col md="6" className="form-group">
                  <label htmlFor="configAssocZip">Código Postal</label>
                  <FormInput id="configAssocZip" placeholder="1234-567"/>
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
                <Col md="6">
                  <FormGroup>
                    <label htmlFor="configAssocIBAN">IBAN (opcional)</label>
                    <FormInput id="configAssocIBAN" placeholder="PT50 1234 4321 12345678901 72"/>
                    <FormFeedback id="configAssocIBANFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
                  </FormGroup>
                </Col>
                <Col md="6" className="form-group">
                  <label htmlFor="configAssocFee">Valor da Quota (€)</label>
                  <FormInput
                    required
                    type="number"
                    id="configAssocFee"
                    placeholder="5"
                  />
                  <FormFeedback id="configAssocIBANFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
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
              <Row form>
                <Col md="6">
                  <FormGroup>
                    <label htmlFor="configAssocCargos">Cargos da Associação <span id="cargosFileTooltip" className="material-icons" style={{fontSize:"100%"}}>info</span></label>
                    <Tooltip
                      open={this.state.cargosFile}
                      target="#cargosFileTooltip"
                      toggle={() => this.toggle("cargosFile")}
                      style={{fontSize:"120%"}}
                    >
                      {cargosFileTipMessage[languageCode]}
                    </Tooltip>
                    <CargosFileUpload />
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


export default ConfigFormNew;

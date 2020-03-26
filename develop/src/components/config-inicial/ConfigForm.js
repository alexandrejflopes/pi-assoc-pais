import React from "react";
import {
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Form,
  FormInput,
  FormGroup,
  FormCheckbox,
  Button, FormTextarea, FormFeedback
} from "shards-react";


import AssocLogoUpload from "./AssocLogoUpload";
import MembersFileUpload from "./MembersFileUpload";
import NewParamsFileUpload from "./NewParamsFileUpload";
import {install} from "../../firebase_scripts/installation";
import StudentsFileUpload from "./StudentsFileUpload";


const ConfigForm = () => (
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
                  <label htmlFor="configAssocEmail">Email</label>
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

            <FormGroup>
              <label htmlFor="configAssocIBAN">IBAN</label>
              <FormInput id="configAssocIBAN" placeholder="PT50 1234 4321 12345678901 72" required/>
              <FormFeedback id="configAssocIBANFeedback" valid={false} style={{display:"none"}}>Por favor, preencha este campo</FormFeedback>
            </FormGroup>
          </Form>
        </Col>

    </ListGroupItem>

    <ListGroupItem className="p-3">
      <Col>
        <Form>
          <Row form>
            <Col md="6">
              <FormGroup>
                <label htmlFor="configAssocLogo">Logótipo (associação/escola) (formatos: PNG, JPEG, SVG)</label>
                <AssocLogoUpload/>
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <label htmlFor="configAssocMembers">Membros da Associação (formato: CSV - ver manual)</label>
                <MembersFileUpload/>
              </FormGroup>
            </Col>
          </Row>

          <Row form>
            <Col md="6">
              <FormGroup>
                <label htmlFor="configAssocStudents">Alunos e Encarregados de Educação (formato: CSV - ver manual)</label>
                <StudentsFileUpload />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <label htmlFor="configAssocNewParams">Parâmetros particulares do contexto da Associação (formato: JSON - ver manual)</label>
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

export default ConfigForm;
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
  FormSelect,
  Button, FormTextarea
} from "shards-react";


import AssocLogoUpload from "./AssocLogoUpload";
import MembersFileUpload from "./MembersFileUpload";
import NewParamsFileUpload from "./NewParamsFileUpload";


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
              />
            </FormGroup>

            {/* Descricao Textarea */}
            <FormGroup>
              <label htmlFor="configAssocDescricao">Descrição (opcional)</label>
              <FormTextarea id="configAssocDescricao" placeholder="Descrição breve da associação e/ou alguns objetivos." />
            </FormGroup>



            <FormGroup>
              <label htmlFor="configAssocAddress">Morada (sede/escola)</label>
              <FormInput id="configAssocAddress" placeholder="Rua Dr. Ricardo Silva, 276 R/C Dto" />
            </FormGroup>

            <Row form>
              <Col md="6" className="form-group">
                <label htmlFor="configAssocLocalidade">Localidade</label>
                <FormInput id="configAssocLocalidade" />
              </Col>
              <Col md="6" className="form-group">
                <label htmlFor="configAssocZip">Código Postal</label>
                <FormInput id="configAssocZip" />
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
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <label htmlFor="configAssocPhone">Telemóvel / Telefone (opcional)</label>
                  <FormInput
                    id="configAssocPhone"
                    type="phone"
                    placeholder="200345678"
                  />
                </FormGroup>

              </Col>
            </Row>

            <FormGroup>
              <label htmlFor="configAssocIBAN">IBAN</label>
              <FormInput id="configAssocIBAN" placeholder="PT50 1234 4321 12345678901 72" />
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
                <label htmlFor="configAssocLogo">Logótipo (formatos: PNG, JPEG, SVG)</label>
                <AssocLogoUpload id="configAssocLogo"/>
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <label htmlFor="configAssocLogo">Membros da Associação (formato: CSV)</label>
                <MembersFileUpload id="configAssocLogo"/>
              </FormGroup>
            </Col>
          </Row>

          <Row form>
            <Col md="6">
              <FormGroup>
                <label htmlFor="configAssocLogo">Alunos e Encarregados de Educação (formato: CSV)</label>
                <AssocLogoUpload id="configAssocLogo"/>
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <label htmlFor="configAssocLogo">Parâmetros particulares do contexto da Associação (formato: JSON - ver manual)</label>
                <NewParamsFileUpload id="configAssocLogo"/>
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
                <FormCheckbox>
                  {/* eslint-disable-next-line */}Li e aceito a{" "}
                  <a href="#">Política de Privacidade</a>.
                </FormCheckbox>
              </FormGroup>
              <Button type="submit">Instalar</Button>
            </Col>
          </Row>
        </Form>
      </Col>
    </ListGroupItem>
  </ListGroup>
);

export default ConfigForm;

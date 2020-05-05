import React from "react";
import Modal from "react-bootstrap/Modal";
import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  FormInput,
  ListGroup,
  ListGroupItem,
  Row,
} from "shards-react";
import {
  defaultAvatar,
  languageCode, newParametersEntities,
  studentsParameters,
} from "../../utils/general_utils";
import { fillRequiredFieldMessage } from "../../utils/messages_strings";
import {newChild, submitChild} from "../../utils/page_titles_strings";
import EducandosModal from "./EducandosModal";



class NewEducandoModal extends React.Component{
  constructor(props) {
    super(props);

    this.state = {
      educando: {},
      show: false,
      nameFeedback: null,
      anoFeedback: null,
      newParamsTypesN: this.props.newParamsTypesN,
    };

    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChangeParam = this.handleChangeParam.bind(this);

    this.submitEducando = this.submitEducando.bind(this);
    this.addEducando = this.addEducando.bind(this);
    this.renderExtra = this.renderExtra.bind(this);
  }

  addEducando(){
    this.closeModal();
  }

  handleChangeParam(e) {
    let educando = this.state.educando;
    let paramName = e.target.name;
    //console.log("paramName to change: " + paramName);
    // update the param with the new value
    educando[paramName] = e.target.value;
    //console.log("educando with new values: " + JSON.stringify(educando));
    this.setState({ educando: educando });
  }

  showModal() {
    this.setState({ show: true });
  }

  closeModal() {
    this.setState({ educando: {} });
    this.setState({ show: false });
  }



  submitEducando(){

  }

  renderExtra() {
    let extraInputs = [];

    console.log("newParamsTypesN -> " + JSON.stringify(this.state.newParamsTypesN));

    const childParamsTypes = this.state.newParamsTypesN[newParametersEntities.student[languageCode]];

    if(childParamsTypes!=null) { // is null when there are no child parameters
      for (let param in childParamsTypes) {

        const idx = "child" + param;
        const type = childParamsTypes[param].type;
        const step = childParamsTypes[param].step;

        const newInput = (
          <FormGroup>
            <label htmlFor={idx}>{param}</label>
            <FormInput
              id={idx}
              type={type}
              step={step}
              name={param}
              placeholder=""
              value={this.state.educando[param]}
              onChange={this.handleChangeParam}
              required
            />
          </FormGroup>
        );
        extraInputs.push(newInput);
      }
    }



    return extraInputs;
  }

  render() {
    //console.log("state a render -> " + JSON.stringify(this.state));
    return (
      <>
        <Button size="sm" className="float-right" onClick={this.showModal}><span className="material-icons" style={{fontSize:"150%", textAlign: "center", verticalAlign:"middle"}}>person_add</span></Button>

        <Modal show={this.state.show} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {newChild[languageCode]}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup flush>
              <ListGroupItem className="p-3">
                <Col>
                  <Row
                    style={{
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <img
                      className="rounded-circle"
                      src={defaultAvatar}
                      alt={newChild[languageCode]}
                      width="110"
                    />
                  </Row>
                  <div style={{ margin: "10px" }} />
                  <Row
                    style={{
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      size="sm"
                      theme="light"
                      id="new_case"
                      onClick={() => {}}
                    >
                      <span className="material-icons md-24">add_a_photo</span>
                    </Button>
                  </Row>

                  <Form>
                    <FormGroup>
                      <label htmlFor="childName">
                        {studentsParameters.NAME[languageCode]}
                      </label>
                      <FormInput
                        id="childName"
                        type="text"
                        name={studentsParameters.NAME[languageCode]}
                        placeholder=""
                        value={this.state.educando[studentsParameters.NAME[languageCode]]}
                        onChange={this.handleChangeParam}
                        required
                      />
                      <FormFeedback
                        id="childNameFeedback"
                        valid={false}
                        style={{ display: "none" }}
                      >
                        {fillRequiredFieldMessage[languageCode]}
                      </FormFeedback>
                    </FormGroup>

                    <FormGroup>
                      <label htmlFor="childSchoolYear">
                        {studentsParameters.SCHOOL_YEAR[languageCode]}
                      </label>
                      <FormInput
                        id="childSchoolYear"
                        type="number"
                        name={studentsParameters.SCHOOL_YEAR[languageCode]}
                        placeholder=""
                        value={this.state.educando[studentsParameters.SCHOOL_YEAR[languageCode]]}
                        onChange={this.handleChangeParam}
                        required
                      />
                      <FormFeedback
                        id="childSchoolYearFeedback"
                        valid={false}
                        style={{ display: "none" }}
                      >
                        {fillRequiredFieldMessage[languageCode]}
                      </FormFeedback>
                    </FormGroup>

                    {this.renderExtra()}
                  </Form>
                </Col>
              </ListGroupItem>
            </ListGroup>
          </Modal.Body>

          <Modal.Footer
            style={{ justifyContent: "left", flexDirection: "column" }}
          >
            <Button variant="primary" onClick={this.addEducando}>
              {submitChild[languageCode]}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}


export default NewEducandoModal;

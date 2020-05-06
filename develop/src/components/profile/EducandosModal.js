/* eslint jsx-a11y/anchor-is-valid: 0 */

import React from "react";
import Modal from "react-bootstrap/Modal";
import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  FormInput,
  FormTextarea,
  ListGroup,
  ListGroupItem,
  Row,
} from "shards-react";
import ListGroupReact from "react-bootstrap/ListGroup";
import {
  defaultAvatar,
  languageCode, newParametersEntities,
  studentsParameters,
} from "../../utils/general_utils";
import { fillRequiredFieldMessage } from "../../utils/messages_strings";
import {
  cancel, deleteChild,
  saveChanges,
  updateInfo,
  updateProfile,
} from "../../utils/common_strings";
import {deleteEducandoFromParent} from "../../firebase_scripts/profile_functions";
import {firebase_auth} from "../../firebase-config";

class EducandosModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      educando: this.props.educando,
      indice: this.props.indice,
      show: false,
      editing: false,
      nameFeedback: null,
      anoFeedback: null,
      oldEducando: null,
      disabled: true,
      newParamsTypes: this.props.newParamsTypes,
    };

    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChangeParam = this.handleChangeParam.bind(this);

    this.enableEditableInputs = this.enableEditableInputs.bind(this);
    this.disableEditableInputs = this.disableEditableInputs.bind(this);
    this.editForm = this.editForm.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.deleteEducando = this.deleteEducando.bind(this);

    this.renderExtra = this.renderExtra.bind(this);
  }

  handleChangeParam(e) {
    let educando = this.state.educando;
    let paramName = e.target.name;
    console.log("paramName to change: " + paramName);
    // update the param with the new value
    educando[paramName] = e.target.value;
    //console.log("educando with new values: " + JSON.stringify(educando));
    this.setState({ educando: educando });
  }

  deleteEducando(){
    deleteEducandoFromParent(firebase_auth.currentUser.email, this.state.educando[studentsParameters.NAME[languageCode]])
      .then((updatedParent) => {
        const upParentString = JSON.stringify(updatedParent);
        console.log("updatedParent recebido depois do delete educando -> " + upParentString);
        // update user data in localstorage
        window.localStorage.setItem("userDoc", upParentString);
        this.closeModal();
        this.props.componentDidMount(true);
      });
  }

  showModal() {
    this.setState({ show: true });
  }

  closeModal() {
    this.setState({ show: false });
  }

  savePreviousChildData() {
    const educando = {...this.state.educando};
    this.setState({ oldEducando: educando });
    //console.log("educando saved: " + JSON.stringify(educando));
  }

  restorePreviousChildData() {
    const oldEducando = {...this.state.oldEducando};
    this.setState({ educando: oldEducando });
    //console.log("educando restored: " + JSON.stringify(oldEducando));
  }

  enableEditableInputs() {
    this.setState({ disabled: false });
  }

  disableEditableInputs() {
    this.setState({ disabled: true });
  }

  editForm() {
    this.savePreviousChildData();
    this.setState({ editing: true });
    this.enableEditableInputs();
  }

  cancelEditing() {
    this.restorePreviousChildData();
    this.setState({ editing: false });
    this.disableEditableInputs();
  }

  renderExtra() {
    let extraInputs = [];
    const isName = (e) => {
      return e === studentsParameters.NAME[languageCode];
    };
    const isSchoolYear = (e) => {
      return e === studentsParameters.SCHOOL_YEAR[languageCode];
    };

    const childParamsTypes = this.state.newParamsTypes[newParametersEntities.student[languageCode]];

    if(childParamsTypes!=null){ // is null when there are no child parameters
      for (let param in childParamsTypes) {
        if (
          isName(param) ||
          isSchoolYear(param) ||
          this.state.educando[param] == null /*in case of a parent param*/
        )
          continue;

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
              disabled={this.state.disabled ? "disabled" : ""}
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
        <Col sm="12" lg="6" md="12" style={{marginBottom: "20px"}}>
          <ListGroupReact flush style={{ textAlign: "center" }}>
            <ListGroupReact.Item
              id={this.state.indice}
              className="p-3"
              action
              onClick={this.showModal}
              style={{ border: "1px solid", borderColor: "#DFE2E4" }}
            >
              <div className="mb-3 mx-auto">
                <img
                  className="rounded-circle"
                  src={
                    this.state.educando[studentsParameters.PHOTO[languageCode]]
                  }
                  alt={
                    this.state.educando[studentsParameters.NAME[languageCode]]
                  }
                  width="50"
                />
              </div>
              <h6 className="mb-0">
                {this.state.educando[studentsParameters.NAME[languageCode]]}
              </h6>
            </ListGroupReact.Item>
          </ListGroupReact>
        </Col>

        <Modal show={this.state.show} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {this.state.educando[studentsParameters.NAME[languageCode]]}
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
                      src={
                        this.state.educando[
                          studentsParameters.PHOTO[languageCode]
                        ]
                      }
                      alt={
                        this.state.educando[
                          studentsParameters.NAME[languageCode]
                        ]
                      }
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
                        value={
                          this.state.educando[
                            studentsParameters.NAME[languageCode]
                          ]
                        }
                        onChange={this.handleChangeParam}
                        required
                        disabled={this.state.disabled ? "disabled" : ""}
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
                        value={
                          this.state.educando[
                            studentsParameters.SCHOOL_YEAR[languageCode]
                          ]
                        }
                        onChange={this.handleChangeParam}
                        required
                        disabled={this.state.disabled ? "disabled" : ""}
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
            {this.state.editing ? (
              <Row>
                <Button style={{marginRight:"40px"}} theme="danger" onClick={this.cancelEditing}>
                  {cancel[languageCode]}
                </Button>
                <Button style={{marginLeft:"40px"}} className="float-right" theme="success" onClick={this.cancelEditing}>
                  {saveChanges[languageCode]}
                </Button>
                {/*<div>
                <div>
                  <Button theme="danger" onClick={this.cancelEditing}>
                    {cancel[languageCode]}
                  </Button>
                </div>{" "}
                <div>
                  <Button theme="success" onClick={this.cancelEditing}>
                    {saveChanges[languageCode]}
                  </Button>
                </div>{" "}
              </div>*/}
              </Row>

            ) : (
              <Row>
                <Button style={{marginRight:"40px"}} theme="accent" onClick={this.editForm}>
                  {updateInfo[languageCode]}
                </Button>
                <Button style={{marginLeft:"40px"}} theme="danger" onClick={this.deleteEducando}>
                  <i className="fa fa-trash mr-1" /> {deleteChild[languageCode]}
                </Button>
              </Row>
            )}
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default EducandosModal;

import React from "react";
import {
  Button,
  Card,
  CardHeader,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  FormInput,
  FormTextarea,
  ListGroup,
  ListGroupItem,
  Row
} from "shards-react";
import {
  assocParameters,
  languageCode, newParametersEntities,
  notAvailableDesignation,
  parentsParameters, showToast, studentsParameters, toastTypes
} from "../../utils/general_utils";
import {saveChanges, cancel, updateProfile} from "../../utils/common_strings";
import {
  assocDataInfoFormTitle,
  profileInfoFormTitle
} from "../../utils/page_titles_strings";
import {
  assocDataUpdateError, assocDataUpdateSuccess,
  changesCommitSuccess,
  childDeleteError,
  childDeleteSuccess,
  fillRequiredFieldMessage,
  invalidZipMessage,
  parentUpdateError,
  parentUpdateSuccess,
  provideRequiredFieldsMessage
} from "../../utils/messages_strings";
import {firebase_auth} from "../../firebase-config";
import {updateParent} from "../../firebase_scripts/profile_functions";
import UserOverview from "./UserOverview";
import UsersOverview from "../blog/UsersOverview";
import UserActions from "../layout/MainNavbar/NavbarNav/UserActions";
import {validZip} from "../../firebase_scripts/installation";
import {
  getAssocDoc,
  updateAssocDoc
} from "../../firebase_scripts/get_assoc_info";


class AssocDataInfo extends React.Component {
  constructor(props) {
    super(props);

    let assoc = null;
    const infoFormTitle = assocDataInfoFormTitle[languageCode];

    if(this.props.assoc!=null){
      assoc = this.props.assoc;
    }

    //const {phone, nif, email, name, cc, job, street, city} = this.props.user;
    this.state = {
      title: infoFormTitle,
      assocDoc : assoc,
      editing : false,
      disabled: true,
      // feedbacks
      feedbacks : {
        [assocParameters.ZIP[languageCode]] : false,
        [assocParameters.DAYS_TO_DELETE_REGISTRATION[languageCode]] : false,
        [assocParameters.DESCRIPTION[languageCode]] : false,
        [assocParameters.EMAIL[languageCode]] : false,
        [assocParameters.IBAN[languageCode]] : false,
        [assocParameters.CITY[languageCode]] : false,
        [assocParameters.LOGO[languageCode]] : false,
        [assocParameters.STREET[languageCode]] : false,
        [assocParameters.NAME[languageCode]] : false,
        [assocParameters.FEE[languageCode]] : false,
        [assocParameters.PHONE[languageCode]] : false,
      },
      oldAssocData: null,
      onUpdateButtonsDisabled : false
    };

    this.handleChangeParam = this.handleChangeParam.bind(this);
    this.enableEditableInputs = this.enableEditableInputs.bind(this);
    this.disableEditableInputs = this.disableEditableInputs.bind(this);
    this.disableUpdateButtons = this.disableUpdateButtons.bind(this);
    this.enableUpdateButtons = this.enableUpdateButtons.bind(this);
    this.editForm = this.editForm.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.lockFormAfterSubmit = this.lockFormAfterSubmit.bind(this);

    this.updateAssoc = this.updateAssoc.bind(this);


  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/

  updateAssoc(){
    const this_ = this;
    const validResult = this_.validForm();
    if(!validResult){
      showToast(provideRequiredFieldsMessage[languageCode], 5000, toastTypes.ERROR);
    }
    else{
      this_.disableEditableInputs();
      this_.disableUpdateButtons();
      //this.cancelEditing();
      //showToast(changesCommitSuccess[languageCode], 5000, toastTypes.SUCCESS);
      updateAssocDoc(this.state.assocDoc)
        .then(() => {
          getAssocDoc()
            .then(doc => {
              if (!doc.exists) {
                console.log('No assotiation document found!');
              }
              else {
                const assocData = doc.data();
                // update assoc data in localstorage
                window.localStorage.setItem("assocDoc", JSON.stringify(assocData));
                console.log("assocData recebida depois do update info -> " + JSON.stringify(assocData));
                this_.lockFormAfterSubmit();
                // TODO: update navbar instantaneously with photo
                showToast(assocDataUpdateSuccess[languageCode], 5000, toastTypes.SUCCESS);
              }
            })
            .catch(err => {
              console.log('Error getting document', err);
            });
        })
        .catch((error) => {
          if(Object.keys(error).length!==0){
            console.log("update error: " + JSON.stringify(error));
            showToast(assocDataUpdateError[languageCode], 5000, toastTypes.ERROR);
            this_.cancelEditing();
            this_.enableUpdateButtons();
          }
        });
    }
  }

  lockFormAfterSubmit(){
    //this.resetFeedbacks();
    this.disableEditableInputs();
    this.enableUpdateButtons();
    this.setState({ editing: false });
    // save new parent data
    const assocDoc = {...this.state.assocDoc};
    this.setState({ oldAssocData: assocDoc });
  }

  disableUpdateButtons(){
    this.setState({ onUpdateButtonsDisabled: true });
  }

  enableUpdateButtons(){
    this.setState({ onUpdateButtonsDisabled: false });
  }

  validForm(){
    // remove all feedbacks at the beginning
    this.resetFeedbacks();

    // check if all inputs are filled
    let changedFeedbacks = {...this.state.feedbacks};
    let allValid = true;

    for(let field in this.state.feedbacks){
      const value = this.state.assocDoc[field];
      if(value==null || value.trim()===""){
        changedFeedbacks[field] = true;
        allValid = false;
      }
    }

    const zip = this.state.assocDoc[assocParameters.ZIP[languageCode]];
    if(!validZip(zip)){
      changedFeedbacks[assocParameters.ZIP[languageCode]] = true;
      allValid = false;
      showToast(invalidZipMessage[languageCode], 5000, toastTypes.ERROR);
    }

    this.state.feedbacks = changedFeedbacks;
    this.forceUpdate();
    return allValid;
  }

  resetFeedbacks(){
    let changedFeedbacks = {...this.state.feedbacks};
    for(let field in changedFeedbacks){
      changedFeedbacks[field] = false;
    }
    this.state.feedbacks = changedFeedbacks;
    this.forceUpdate();
  }

  handleChangeParam(e) {
    let assocDoc = this.state.assocDoc;
    let paramName = e.target.name;
    console.log("paramName to change: " + paramName);
    // update the param with the new value
    assocDoc[paramName] = e.target.value;
    //console.log("assocDoc with new values: " + JSON.stringify(parent));
    this.setState({ assocDoc: assocDoc });
  }

  savePreviousParentData() {
    const assocDoc = {...this.state.assocDoc};
    this.setState({ oldAssocData: assocDoc });
    //console.log("assocDoc saved: " + JSON.stringify(parent));
  };

  restorePreviousParentData() {
    const oldAssocData = {...this.state.oldAssocData};
    this.setState({ assocDoc: oldAssocData });
    console.log("assocDoc restored: " + JSON.stringify(oldAssocData));
  };

  enableEditableInputs() {
    this.setState({ disabled: false });
  }

  disableEditableInputs() {
    this.setState({ disabled: true });
  }

  editForm(){
    this.savePreviousParentData();
    this.setState({editing : true});
    this.enableEditableInputs();
  }

  cancelEditing() {
    this.restorePreviousParentData();
    this.setState({ editing: false });
    this.disableEditableInputs();
  }


  render() {
    return (
      <Card small className="mb-4">
        <CardHeader className="border-bottom">
          <h6 className="m-0">{this.state.title}</h6>
        </CardHeader>
        <ListGroup flush>
          <ListGroupItem className="p-3">
            <Row>
              <Col>
                <Form>
                  <Row form>
                    {/* First Name */}
                    <Col md="12" className="form-group">
                      <label htmlFor="assocName">{assocParameters.NAME[languageCode]}</label>
                      <FormInput
                        required
                        id="feName"
                        name={assocParameters.NAME[languageCode]}
                        placeholder={assocParameters.NAME[languageCode]}
                        value={
                          this.state.assocDoc[
                            assocParameters.NAME[languageCode]
                            ]
                        }
                        onChange={this.handleChangeParam}
                        invalid={this.state.feedbacks[assocParameters.NAME[languageCode]]}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                    {/* Email */}
                    {/*<Col md="6" className="form-group">
                      <label htmlFor="parentEmail">{parentsParameters.EMAIL[languageCode]}</label>
                      <FormInput
                        required
                        type="email"
                        id="parentEmail"
                        name={parentsParameters.EMAIL[languageCode]}
                        placeholder={parentsParameters.EMAIL[languageCode]}
                        value={
                          this.state.parent[parentsParameters.EMAIL[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        invalid={this.state.feedbacks[parentsParameters.EMAIL[languageCode]]}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>*/}
                  </Row>
                  <Row form>
                    {/* Phone */}
                    <Col md="6" className="form-group">
                      <label htmlFor="parentPhone">{parentsParameters.PHONE[languageCode]}</label>
                      <FormInput
                        required
                        type="tel"
                        id="parentPhone"
                        name={parentsParameters.PHONE[languageCode]}
                        placeholder={parentsParameters.PHONE[languageCode]}
                        value={
                          this.state.parent[parentsParameters.PHONE[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        invalid={this.state.feedbacks[parentsParameters.PHONE[languageCode]]}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                    {/* Job */}
                    <Col md="6" className="form-group">
                      <label htmlFor="parentJob">{parentsParameters.JOB[languageCode]}</label>
                      <FormInput
                        id="parentJob"
                        name={parentsParameters.JOB[languageCode]}
                        placeholder={parentsParameters.JOB[languageCode]}
                        value={
                          this.state.parent[parentsParameters.JOB[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        invalid={this.state.feedbacks[parentsParameters.JOB[languageCode]]}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                  </Row>
                  <Row form>
                    {/* Address | Street */}
                    <Col md="6" className="form-group">
                      <label htmlFor="parentStreet">{parentsParameters.STREET[languageCode]}</label>
                      <FormInput
                        required
                        id="parentStreet"
                        name={parentsParameters.STREET[languageCode]}
                        placeholder={parentsParameters.STREET[languageCode]}
                        value={
                          this.state.parent[parentsParameters.STREET[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        invalid={this.state.feedbacks[parentsParameters.STREET[languageCode]]}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                    {/* City */}
                    <Col md="4" className="form-group">
                      <label htmlFor="parentCity">{parentsParameters.CITY[languageCode]}</label>
                      <FormInput
                        required
                        id="parentCity"
                        name={parentsParameters.CITY[languageCode]}
                        placeholder={parentsParameters.CITY[languageCode]}
                        value={
                          this.state.parent[parentsParameters.CITY[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        invalid={this.state.feedbacks[parentsParameters.CITY[languageCode]]}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                    {/* Zip Code */}
                    <Col md="2" className="form-group">
                      <label htmlFor="parentZipCode">{parentsParameters.ZIPCODE[languageCode]}</label>
                      <FormInput
                        required
                        id="parentZipCode"
                        name={parentsParameters.ZIPCODE[languageCode]}
                        placeholder={parentsParameters.ZIPCODE[languageCode]}
                        value={
                          this.state.parent[parentsParameters.ZIPCODE[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        invalid={this.state.feedbacks[parentsParameters.ZIPCODE[languageCode]]}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                  </Row>
                  <Row form>
                    {/* Finance number */}
                    <Col md="6" className="form-group">
                      <label htmlFor="parentNIF">{parentsParameters.NIF[languageCode]}</label>
                      <FormInput
                        required
                        id="parentNIF"
                        name={parentsParameters.NIF[languageCode]}
                        placeholder={parentsParameters.NIF[languageCode]}
                        value={
                          this.state.parent[parentsParameters.NIF[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        invalid={this.state.feedbacks[parentsParameters.NIF[languageCode]]}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                    {/* Citizen Card */}
                    <Col md="6" className="form-group">
                      <label htmlFor="parentCC">{parentsParameters.CC[languageCode]}</label>
                      <FormInput
                        id="parentCC"
                        name={parentsParameters.CC[languageCode]}
                        placeholder={parentsParameters.CC[languageCode]}
                        value={
                          this.state.parent[parentsParameters.CC[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        //invalid={this.state.feedbacks[parentsParameters.CC[languageCode]]}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                  </Row>
                  <hr />
                  {this.renderExtra()}

                  { this.state.editing ? <div><Button theme="danger" onClick={this.cancelEditing} disabled={this.state.onUpdateButtonsDisabled}>{cancel[languageCode]}</Button> <Button theme="success" className="float-right" onClick={this.updateParent} disabled={this.state.onUpdateButtonsDisabled}>{saveChanges[languageCode]}</Button> </div>
                    : <Button theme="accent" onClick={this.editForm}>{updateProfile[languageCode]}</Button>
                  }
                </Form>
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>
      </Card>
    );
  }
}





export default AssocDataInfo;

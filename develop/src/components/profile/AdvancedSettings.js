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
  languageCode,
  parentsParameters, showToast, toastTypes
} from "../../utils/general_utils";
import {
  saveChanges,
  cancel,
  changeEmail
} from "../../utils/common_strings";
import {
  profileSettingsDataFormTitle
} from "../../utils/page_titles_strings";
import {
  provideRequiredFieldsMessage, confirmUpdateEmail
} from "../../utils/messages_strings";


class AdvancedSettings extends React.Component {
  constructor(props) {
    super(props);

    let parent = null;
    const infoFormTitle = profileSettingsDataFormTitle[languageCode];

    if(this.props.user!=null){
      parent = this.props.user;
    }

    //const {phone, nif, email, name, cc, job, street, city} = this.props.user;
    this.state = {
      title: infoFormTitle,
      parent : parent,
      editing : false,
      disabled: true,
      // feedbacks
      feedbacks : {
        [parentsParameters.EMAIL[languageCode]] : false,
      },
      oldParent: null,
    };

    this.handleChangeParam = this.handleChangeParam.bind(this);
    this.enableEditableInputs = this.enableEditableInputs.bind(this);
    this.disableEditableInputs = this.disableEditableInputs.bind(this);
    this.editForm = this.editForm.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.lockFormAfterUpdate = this.lockFormAfterUpdate.bind(this);

    this.updateParent = this.updateParent.bind(this);


  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/

  updateParent(){
    const validResult = this.validForm();
    if(!validResult){
      showToast(provideRequiredFieldsMessage[languageCode], 5000, toastTypes.ERROR);
    }
    else{
      const confirmation = window.confirm(confirmUpdateEmail[languageCode]);
      this.cancelEditing();
    }
  }

  lockFormAfterUpdate(){
    //this.resetFeedbacks();
    this.disableEditableInputs();
    this.setState({ editing: false });
    // save new parent data
    const parent = {...this.state.parent};
    this.setState({ oldParent: parent });
  }

  validForm(){
    // remove all feedbacks at the beginning
    this.resetFeedbacks();

    // check if all inputs are filled
    let changedFeedbacks = {...this.state.feedbacks};
    let allValid = true;

    for(let field in this.state.feedbacks){
      const value = this.state.parent[field];
      if(value==null || value.trim()===""){
        changedFeedbacks[field] = true;
        allValid = false;
      }
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
    let parent = this.state.parent;
    let paramName = e.target.name;
    //console.log("paramName to change: " + paramName);
    // update the param with the new value
    parent[paramName] = e.target.value;
    //console.log("parent with new values: " + JSON.stringify(parent));
    this.setState({ parent: parent });
  }

  savePreviousParentData() {
    const parent = {...this.state.parent};
    this.setState({ oldParent: parent });
    //console.log("parent saved: " + JSON.stringify(parent));
  };

  restorePreviousParentData() {
    const oldParent = {...this.state.oldParent};
    this.setState({ parent: oldParent });
    //console.log("parent restored: " + JSON.stringify(oldParent));
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
                    {/* Email */}
                    <Col md="12" className="form-group">
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
                    </Col>
                  </Row>
                  <hr />

                  { this.state.editing ? <div><Button theme="danger" onClick={this.cancelEditing}>{cancel[languageCode]}</Button> <Button theme="success" className="float-right" onClick={this.updateParent}>{saveChanges[languageCode]}</Button> </div>
                    : <Button theme="accent" onClick={this.editForm}>{changeEmail[languageCode]}</Button>
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





export default AdvancedSettings;

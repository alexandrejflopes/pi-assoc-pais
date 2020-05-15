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
  changeEmail, yes, no, attentionPrompt, updateEmailPrompt
} from "../../utils/common_strings";
import {
  profileSettingsDataFormTitle
} from "../../utils/page_titles_strings";
import {
  provideRequiredFieldsMessage,
  confirmUpdateEmail,
  genericEmailUpdateErrorMsg,
  emailAlreadyTaken,
  parentUpdateSuccess,
  parentUpdateError,
  emailUpdateSuccess,
  confirmLogoutAndNewLink
} from "../../utils/messages_strings";
import {firebase_auth, firebase} from "../../firebase-config";
import {
  emailExistsInDB,
  emailExistsInFBAuth, sendChangeEmailAuth, updateParentEmail, userLogOut
} from "../../firebase_scripts/profile_functions";
import ConfirmationDialog from "../dialog/ConfirmationDialog";
import AknowledgementDialog from "../dialog/AknowledgementDialog";


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
      dialogOpen : false,
      emailUpdatedDialogOpen : false,
      this_ : this
    };

    this.handleChangeParam = this.handleChangeParam.bind(this);
    this.enableEditableInputs = this.enableEditableInputs.bind(this);
    this.disableEditableInputs = this.disableEditableInputs.bind(this);
    this.editForm = this.editForm.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.lockFormAfterUpdate = this.lockFormAfterUpdate.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.closeSuccessDialog = this.closeSuccessDialog.bind(this);
    this.openSuccessDialog = this.openSuccessDialog.bind(this);

    this.updateEmail = this.updateEmail.bind(this);


  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/


  updateEmail(confirmation){

    console.log("result dialog: " + confirmation);
    this.closeDialog();

    const this_ = this;
    const validResult = this_.validForm();

    const localUser = JSON.parse(window.localStorage.getItem("userDoc"));
    const userName = localUser[parentsParameters.NAME[languageCode]];

    const currentEmail = localUser[parentsParameters.EMAIL[languageCode]];
    const newEmail = this_.state.parent[parentsParameters.EMAIL[languageCode]];

    console.log("currentEmail -> " + currentEmail);
    console.log("newEmail -> " + newEmail);

    if(!validResult){
      showToast(provideRequiredFieldsMessage[languageCode], 5000, toastTypes.ERROR);
    }
    // if current and new email are the same, do nothing
    else if(currentEmail===newEmail){
      this.cancelEditing();
    }
    else{
      //const confirmation = window.confirm(confirmUpdateEmail[languageCode]);
      if(confirmation){

        let FBuser = firebase_auth.currentUser;
        // in case of, for some reason, these don't match
        if(currentEmail!==FBuser.email){
          showToast(genericEmailUpdateErrorMsg[languageCode], 5000, toastTypes.ERROR);
          this_.cancelEditing();
          return;
        }

        // just to check if the current email exists in FB Auth
        // if so, we can proceed
        emailExistsInFBAuth(currentEmail)
          .then((exists) => {
            if(exists){
              console.log("current existe na Auth");
              // just to check if the current email exists in DB
              // if so, we can proceed
              emailExistsInDB(currentEmail)
                .then((exists) => {
                  if(exists){
                    console.log("current existe na DB");

                    // check if the new email exists in FB Auth (already taken)
                    // if so, we cannot proceed
                    emailExistsInFBAuth(newEmail)
                      .then((exists) => {
                        if(!exists){
                          console.log("newEmail não existe na Auth");
                          // just to check if the new email exists in DB (already taken)
                          // if so, we cannot proceed
                          emailExistsInDB(newEmail)
                            .then((exists) => {
                              if(!exists){
                                console.log("newEmail não existe na DB");
                                // if all conditions are set, then update email

                                updateParentEmail(currentEmail, newEmail)
                                  .then((result) => {
                                    if(result.error==null){
                                      const upParentString = JSON.stringify(result);
                                      console.log("updatedParent recebido depois do update email -> " + upParentString);
                                      // update user data in localstorage
                                      window.localStorage.setItem("userDoc", upParentString);
                                      this_.lockFormAfterUpdate();
                                      this_.props.componentDidMount(true);
                                      console.log("firebase user (não) atualizado: " + JSON.stringify(firebase_auth.currentUser));
                                      //showToast(emailUpdateSuccess[languageCode], 5000, toastTypes.SUCCESS);
                                      this_.openSuccessDialog();
                                    }
                                    else{
                                      console.log("result error: " + JSON.stringify(result));
                                      showToast(genericEmailUpdateErrorMsg[languageCode], 5000, toastTypes.ERROR);
                                      this_.cancelEditing();
                                    }

                                  })
                                  .catch((error) => {
                                    if(Object.keys(error).length!==0){
                                      console.log("update error: " + JSON.stringify(error));
                                      showToast(genericEmailUpdateErrorMsg[languageCode], 5000, toastTypes.ERROR);
                                      this_.cancelEditing();
                                    }
                                  });
                              }
                              else{
                                console.log("newEmail já existe na DB");
                                showToast(emailAlreadyTaken[languageCode], 5000, toastTypes.ERROR);
                                this_.cancelEditing();
                              }
                            })
                            .catch(() => {
                              console.log("generic error 6");
                              showToast(genericEmailUpdateErrorMsg[languageCode], 5000, toastTypes.ERROR);
                              this_.cancelEditing();
                            });
                        }
                        else{
                          console.log("newEmail já existe na Auth");
                          showToast(emailAlreadyTaken[languageCode], 5000, toastTypes.ERROR);
                          this_.cancelEditing();
                        }
                      })
                      .catch(() => {
                        console.log("generic error 5");
                        showToast(genericEmailUpdateErrorMsg[languageCode], 5000, toastTypes.ERROR);
                        this_.cancelEditing();
                      });

                  }
                  else{
                    console.log("generic error 4");
                    showToast(genericEmailUpdateErrorMsg[languageCode], 5000, toastTypes.ERROR);
                    this_.cancelEditing();
                  }
                })
                .catch(() => {
                  console.log("generic error 3");
                  showToast(genericEmailUpdateErrorMsg[languageCode], 5000, toastTypes.ERROR);
                  this_.cancelEditing();
                });
            }
            else{
              console.log("generic error 2");
              showToast(genericEmailUpdateErrorMsg[languageCode], 5000, toastTypes.ERROR);
              this_.cancelEditing();
            }
          })
          .catch(() => {
            console.log("generic error 1");
            showToast(genericEmailUpdateErrorMsg[languageCode], 5000, toastTypes.ERROR);
            this_.cancelEditing();
          });
      }
      else{
        this.closeDialog();
        this_.cancelEditing();
      }


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


  closeDialog() {
    this.setState({dialogOpen : false});
  }

  openDialog() {
    this.setState({dialogOpen : true});
  }

  closeSuccessDialog() {
    this.setState({emailUpdatedDialogOpen : false});
  }

  openSuccessDialog() {
    this.setState({emailUpdatedDialogOpen : true});
  }

  finnishUpdateEmailFlow(parent){
    const this_ = parent;
    this_.closeSuccessDialog();
    const localUser = JSON.parse(window.localStorage.getItem("userDoc"));
    const userName = localUser[parentsParameters.NAME[languageCode]];
    const newEmail = this_.state.parent[parentsParameters.EMAIL[languageCode]];
    userLogOut();
    sendChangeEmailAuth(userName, newEmail).then();
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

                  { this.state.editing ? <div><Button theme="danger" onClick={this.cancelEditing}>{cancel[languageCode]}</Button> <Button theme="success" className="float-right" onClick={this.openDialog}>{saveChanges[languageCode]}</Button> </div>
                    : <Button theme="accent" onClick={this.editForm}>{changeEmail[languageCode]}</Button>
                  }
                </Form>
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>

        {this.state.dialogOpen ?
          <ConfirmationDialog
            open={this.state.dialogOpen}
            result={this.updateEmail}
            title={updateEmailPrompt[languageCode]}
            message={confirmUpdateEmail[languageCode]}/>
          : null}

        {this.state.emailUpdatedDialogOpen ?
          <AknowledgementDialog
            open={this.state.emailUpdatedDialogOpen}
            after={this.finnishUpdateEmailFlow}
            title={emailUpdateSuccess[languageCode]}
            message={confirmLogoutAndNewLink[languageCode]}
            parent={this}/>
          : null}

      </Card>

    );
  }
}





export default AdvancedSettings;

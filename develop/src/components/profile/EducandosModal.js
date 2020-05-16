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
  languageCode, newParametersEntities, parentsParameters, showToast,
  studentsParameters, toastTypes,
} from "../../utils/general_utils";
import {
  changesCommitSuccess,
  childAddedSuccess, childAddPhotoError, childDeleteError,
  childDeleteSuccess, childUpdateError, childUpdateSucess,
  confirmDeleteChild,
  fillRequiredFieldMessage, parentUpdatePhotoError, parentUpdatePhotoSuccess,
  provideRequiredFieldsMessage,
  sameChildNameError
} from "../../utils/messages_strings";
import {
  cancel, deleteChild,
  saveChanges,
  updateInfo,
} from "../../utils/common_strings";
import {
  addEducandoToParent,
  deleteEducandoFromParent,
  updateEducando,
  updateParent,
  uploadChildPhoto,
  uploadProfilePhoto
} from "../../firebase_scripts/profile_functions";
import {firebase_auth, storage} from "../../firebase-config";

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
      feedbacks : {
        [studentsParameters.NAME[languageCode]] : false,
        [studentsParameters.SCHOOL_YEAR[languageCode]] : false
      },
      newPhoto : this.props.educando[studentsParameters.PHOTO[languageCode]],
      fileToUpload : null
    };


    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChangeParam = this.handleChangeParam.bind(this);
    this.handleChangePhoto = this.handleChangePhoto.bind(this);

    this.enableEditableInputs = this.enableEditableInputs.bind(this);
    this.disableEditableInputs = this.disableEditableInputs.bind(this);
    this.editForm = this.editForm.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.deleteEducando = this.deleteEducando.bind(this);
    this.updateEducando = this.updateEducando.bind(this);

    this.renderExtra = this.renderExtra.bind(this);
  }

  updateEducando(){
    const validResult = this.validForm();
    if(!validResult){
      showToast(provideRequiredFieldsMessage[languageCode], 5000, toastTypes.ERROR);
    }
    else{
      const uniqueChildName = this.checkUniqueChildName();
      if(!uniqueChildName){
        showToast(sameChildNameError[languageCode], 5000, toastTypes.ERROR);
      }
      else{
        const closeModal = this.closeModal;
        const myComponentDidMount = this.props.componentDidMount;
        let myState = {...this.state};

        const originalPhotoURL = this.state.oldEducando[studentsParameters.PHOTO[languageCode]];
        const newPhotoFile = this.state.fileToUpload;

        const previousName = this.state.oldEducando[studentsParameters.NAME[languageCode]];

        // if photo changed, upload it as well
        if(this.state.newPhoto!==originalPhotoURL){
          /*
          * this will catch the error of trying to get the reference for the
          * defaultAvatar reference, which does not exist
          * */
          try{
            let previousPhotoRef = storage.refFromURL(originalPhotoURL);
            // delete current photo to save the new and not cluttering the storage
            previousPhotoRef.delete()
              .then(() => {
                const uploadTask = uploadChildPhoto(newPhotoFile);
                uploadTask
                  .then((snapshot) => {
                    // Handle successful uploads on complete
                    // get the download URL
                    snapshot.ref.getDownloadURL().then(function (downloadURL) {

                      let updatedEducando = {...myState.educando};
                      updatedEducando[studentsParameters.PHOTO[languageCode]] = downloadURL;

                      updateEducando(firebase_auth.currentUser.email, updatedEducando, previousName)
                        .then((updatedParent) => {
                          const upParentString = JSON.stringify(updatedParent);
                          console.log("updatedParent recebido depois do update educando -> " + upParentString);
                          // update user data in localstorage
                          window.localStorage.setItem("userDoc", upParentString);
                          closeModal();
                          myComponentDidMount(true);
                          showToast(childUpdateSucess[languageCode], 5000, toastTypes.SUCCESS);
                        })
                        .catch((error) => {
                          showToast(childUpdateError[languageCode], 5000, toastTypes.ERROR);
                        });

                    });
                  })
                  .catch((error) => {
                    console.log("Logo upload failed: " + JSON.stringify(error));
                    showToast(childAddPhotoError[languageCode], 5000, toastTypes.ERROR);
                    closeModal();
                  });
              })
              .catch(() => {
                console.log("erro no delete");
                showToast(parentUpdatePhotoError[languageCode], 5000, toastTypes.ERROR);
                closeModal();
              });
          }
          catch (e) {
            const uploadTask = uploadChildPhoto(newPhotoFile);
            uploadTask
              .then((snapshot) => {
                // Handle successful uploads on complete
                // get the download URL
                snapshot.ref.getDownloadURL().then(function (downloadURL) {

                  let updatedEducando = {...myState.educando};
                  updatedEducando[studentsParameters.PHOTO[languageCode]] = downloadURL;

                  updateEducando(firebase_auth.currentUser.email, updatedEducando, previousName)
                    .then((updatedParent) => {
                      const upParentString = JSON.stringify(updatedParent);
                      console.log("updatedParent recebido depois do update educando -> " + upParentString);
                      // update user data in localstorage
                      window.localStorage.setItem("userDoc", upParentString);
                      closeModal();
                      myComponentDidMount(true);
                      showToast(childUpdateSucess[languageCode], 5000, toastTypes.SUCCESS);
                    })
                    .catch((error) => {
                      showToast(childUpdateError[languageCode], 5000, toastTypes.ERROR);
                    });

                });
              })
              .catch((error) => {
                console.log("Logo upload failed: " + JSON.stringify(error));
                showToast(childAddPhotoError[languageCode], 5000, toastTypes.ERROR);
                closeModal();
              });
          }
        }
        else{
          const previousName = this.state.oldEducando[studentsParameters.NAME[languageCode]];
          updateEducando(firebase_auth.currentUser.email, this.state.educando, previousName)
            .then((updatedParent) => {
              const upParentString = JSON.stringify(updatedParent);
              console.log("updatedParent recebido depois do update educando -> " + upParentString);
              // update user data in localstorage
              window.localStorage.setItem("userDoc", upParentString);
              closeModal();
              myComponentDidMount(true);
              showToast(childUpdateSucess[languageCode], 5000, toastTypes.SUCCESS);
            })
            .catch((error) => {
              showToast(childUpdateError[languageCode], 5000, toastTypes.ERROR);
            });
        }

      }

    }
  }


  checkUniqueChildName(){
    const nameToAdd = this.state.educando[studentsParameters.NAME[languageCode]];
    const initialName = this.state.oldEducando[studentsParameters.NAME[languageCode]];
    const localUser = JSON.parse(window.localStorage.getItem("userDoc"));
    const nameDesignation = studentsParameters.NAME[languageCode];
    const educandos = localUser[parentsParameters.CHILDREN[languageCode]];

    const names = [];
    for (let i in educandos){
      const educando = educandos[i];
      const currentName = educando[nameDesignation];
      if(currentName===initialName)
        continue;
      names.push(currentName);
    }

    if(names.includes(nameToAdd)){
      this.showInvalidNameFeedback();
      return false;
    }

    this.hideInvalidNameFeedback();
    return true;
  }

  validForm(){
    // remove all feedbacks at the beginning
    this.resetFeedbacks();

    // check if all inputs are filled
    let changedFeedbacks = {...this.state.feedbacks};
    let allFilled = true;

    for(let field in this.state.feedbacks){
      const value = this.state.educando[field];
      if(value==null || value.trim()===""){
        changedFeedbacks[field] = true;
        allFilled = false;
      }
    }
    this.state.feedbacks = changedFeedbacks;
    this.forceUpdate();
    return allFilled;
  }

  showInvalidNameFeedback(){
    this.state.feedbacks[studentsParameters.NAME[languageCode]] = true;
    this.forceUpdate();
  }

  hideInvalidNameFeedback(){
    this.state.feedbacks[studentsParameters.NAME[languageCode]] = false;
    this.forceUpdate();
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
    let educando = this.state.educando;
    let paramName = e.target.name;
    //console.log("paramName to change: " + paramName);
    // update the param with the new value
    educando[paramName] = e.target.value;
    //console.log("educando with new values: " + JSON.stringify(educando));
    this.setState({ educando: educando });
  }

  handleChangePhoto(e) {
    //console.log("state antes: " + JSON.stringify(this.state));
    //console.log("file: " + e.target.files[0].name);
    const imageFile = e.target.files[0];
    //console.log("imageFile: " + imageFile);
    const imageTempUrl = URL.createObjectURL(imageFile);
    //console.log("tempURL: " + imageTempUrl);
    this.setState({fileToUpload : imageFile, newPhoto : imageTempUrl});
  }

  deleteEducando(){
    const confirmation = window.confirm(confirmDeleteChild[languageCode]);
    const photoUrl = this.state.educando[studentsParameters.PHOTO[languageCode]];
    if(confirmation){
      deleteEducandoFromParent(firebase_auth.currentUser.email, this.state.educando[studentsParameters.NAME[languageCode]])
        .then((updatedParent) => {

          // delete its photo from storage
          try{
            let photoRef = storage.refFromURL(photoUrl);
            // delete current photo to save the new and not cluttering the storage
            photoRef.delete()
              .then(() => {
                const upParentString = JSON.stringify(updatedParent);
                console.log("updatedParent recebido depois do delete educando -> " + upParentString);
                // update user data in localstorage
                window.localStorage.setItem("userDoc", upParentString);
                this.closeModal();
                this.props.componentDidMount(true);
                showToast(childDeleteSuccess[languageCode], 5000, toastTypes.SUCCESS);
              })
              .catch(() => {
                console.log("erro no delete");
                showToast(parentUpdatePhotoError[languageCode], 5000, toastTypes.ERROR);
                this.restoreOriginalPhoto();
              });
          }
          catch(e){
            const upParentString = JSON.stringify(updatedParent);
            console.log("updatedParent recebido depois do delete educando -> " + upParentString);
            // update user data in localstorage
            window.localStorage.setItem("userDoc", upParentString);
            this.closeModal();
            this.props.componentDidMount(true);
            showToast(childDeleteSuccess[languageCode], 5000, toastTypes.SUCCESS);
          }

        })
        .catch((error) => {
          showToast(childDeleteError[languageCode], 5000, toastTypes.ERROR);
        });
    }


  }

  showModal() {
    this.setState({ show: true });
  }

  closeModal() {
    this.disableEditableInputs();
    // save new educando data
    const educando = {...this.state.educando};
    this.setState({ oldEducando: educando, show : false, newPhoto : this.state.educando[studentsParameters.PHOTO[languageCode]], fileToUpload : null });
  }

  savePreviousChildData() {
    const educando = {...this.state.educando};
    this.setState({ oldEducando: educando });
    //console.log("educando saved: " + JSON.stringify(educando));
  }

  restorePreviousChildData() {
    const oldEducando = {...this.state.oldEducando};
    this.setState({ educando: oldEducando });
    this.setState({ newPhoto: oldEducando[studentsParameters.PHOTO[languageCode]] });
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
    this.resetFeedbacks();
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

        // add feedback control variable
        let updatedFeedbacks = {...this.state.feedbacks};
        updatedFeedbacks[param] = false;
        this.state.feedbacks = updatedFeedbacks;
        const feedbackIdx = "child" + param + "Feedback";

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
              invalid={this.state.feedbacks[param]}
            />
            <FormFeedback
              id={feedbackIdx}
              valid={false}
              style={{ display: "none" }}
            >
              {fillRequiredFieldMessage[languageCode]}
            </FormFeedback>
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
              <Row style={{
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
              }}>
                <div style={{
                  width : "50px",
                  height: "50px",
                  backgroundImage: "url(" + this.state.educando[studentsParameters.PHOTO[languageCode]] + ")",
                  backgroundPosition : "center",
                  borderRadius: "50%",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat"
                }}>
                </div>
              </Row>
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
                    <div style={{
                      width : "110px",
                      height: "110px",
                      backgroundImage: "url(" + this.state.newPhoto + ")",
                      backgroundPosition : "center",
                      borderRadius: "50%",
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat"
                    }}>
                    </div>
                  </Row>
                  <div style={{ margin: "10px" }} />
                  {this.state.editing ? <Row
                    style={{
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Row style={{justifyContent: "center", alignItems: "center", marginBottom: "5px"}}>
                      <Button
                        size="sm"
                        theme="light"
                        id="add-photo-button"
                      >
                        <label htmlFor="file-upload-input" style={{cursor: "pointer", padding:"0px", margin : "0px"}}>
                          <span className="material-icons md-24">add_a_photo</span>
                        </label>
                      </Button>
                      <input
                        id="file-upload-input"
                        type="file"
                        accept="image/png, image/jpeg"
                        style={{display: "none", margin: "0px"}}
                        onChange={this.handleChangePhoto}/>
                    </Row>
                  </Row> :
                  " "}
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
                        invalid={this.state.feedbacks[studentsParameters.NAME[languageCode]]}
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
                        invalid={this.state.feedbacks[studentsParameters.SCHOOL_YEAR[languageCode]]}
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
                <Button style={{marginLeft:"40px"}} className="float-right" theme="success" onClick={this.updateEducando}>
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

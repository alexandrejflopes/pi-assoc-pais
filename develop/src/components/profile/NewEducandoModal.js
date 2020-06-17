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
  languageCode, newParametersEntities, parentsParameters, showToast,
  studentsParameters, toastTypes,
} from "../../utils/general_utils";
import {
  childAddedError,
  childAddedSuccess, childAddPhotoError,
  fillRequiredFieldMessage,
  provideRequiredFieldsMessage, sameChildNameError
} from "../../utils/messages_strings";
import {newChild, submitChild} from "../../utils/page_titles_strings";
import {
  addEducandoToParent,
  filterDeletedEducandosArray,
  uploadChildPhoto,
} from "../../firebase_scripts/profile_functions";
import {firebase_auth} from "../../firebase-config";



class NewEducandoModal extends React.Component{
  constructor(props) {
    super(props);

    this.state = {
      educando: {},
      show: false,
      nameFeedback: null,
      anoFeedback: null,
      newParamsTypesN: this.props.newParamsTypesN,
      educandoFoto : defaultAvatar,
      feedbacks : {
        [studentsParameters.NAME[languageCode]] : false,
        [studentsParameters.SCHOOL_YEAR[languageCode]] : false
      },
      originalPhoto : defaultAvatar,
      fileToUpload : null
    };

    this.initial = {
      educando: {},
      show: false,
      nameFeedback: null,
      anoFeedback: null,
      newParamsTypesN: this.props.newParamsTypesN,
      educandoFoto : defaultAvatar,
      feedbacks : {
        [studentsParameters.NAME[languageCode]] : false,
        [studentsParameters.SCHOOL_YEAR[languageCode]] : false
      },
      originalPhoto : defaultAvatar,
      fileToUpload : null,
      onCreateButtonDisabled : false,
    };

    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.resetState = this.resetState.bind(this);
    this.handleChangeParam = this.handleChangeParam.bind(this);
    this.handleChangePhoto = this.handleChangePhoto.bind(this);

    this.addEducando = this.addEducando.bind(this);
    this.renderExtra = this.renderExtra.bind(this);
    this.validForm = this.validForm.bind(this);
    this.resetFeedbacks = this.resetFeedbacks.bind(this);

    this.disableCreateButtonAndInputs = this.disableCreateButtonAndInputs.bind(this);
    this.enableCreateButtonAndInputs = this.enableCreateButtonAndInputs.bind(this);

  }

  handleChangePhoto(e) {
    const imageFile = e.target.files[0];
    if(imageFile!=null){
      const imageTempUrl = URL.createObjectURL(imageFile);
      this.setState({fileToUpload : imageFile, educandoFoto : imageTempUrl});
    }
  }


  addEducando(){
    const this_ = this;
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
        this_.disableCreateButtonAndInputs();
        let myState = {...this.state};

        // if photo changed, upload it as well
        if(this.state.educandoFoto!==this.state.originalPhoto){
          const newPhotoFile = this.state.fileToUpload;
          const uploadTask = uploadChildPhoto(newPhotoFile);

          uploadTask
            .then((snapshot) => {
              // Handle successful uploads on complete
              // get the download URL
              snapshot.ref.getDownloadURL().then(function (downloadURL) {
                addEducandoToParent(firebase_auth.currentUser.email, myState.educando, downloadURL)
                  .then((updatedParent) => {
                    if(updatedParent.error!=null || Object.keys(updatedParent).length===0){
                      showToast(childAddedError[languageCode], 5000, toastTypes.ERROR);
                      this_.enableCreateButtonAndInputs();
                    }
                    else{
                      const upParentString = JSON.stringify(updatedParent);
                      //console.log("updatedParent recebido depois do update -> " + upParentString);
                      // update user data in localstorage
                      window.localStorage.setItem("userDoc", upParentString);
                      this_.closeModal();
                      this_.props.componentDidMount(true);
                      showToast(childAddedSuccess[languageCode], 5000, toastTypes.SUCCESS);
                    }

                  });
              });
            })
            .catch((error) => {
              console.log("Photo upload failed: " + JSON.stringify(error));
              showToast(childAddPhotoError[languageCode], 5000, toastTypes.ERROR);
              this_.enableCreateButtonAndInputs();
            });
        }
        else{
          addEducandoToParent(firebase_auth.currentUser.email, myState.educando, myState.educandoFoto)
            .then((updatedParent) => {
              if(updatedParent.error!=null || Object.keys(updatedParent).length===0){
                showToast(childAddedError[languageCode], 5000, toastTypes.ERROR);
                this_.enableCreateButtonAndInputs();
              }
              else{
                const upParentString = JSON.stringify(updatedParent);
                //console.log("updatedParent recebido depois do update -> " + upParentString);
                // update user data in localstorage
                window.localStorage.setItem("userDoc", upParentString);
                this_.closeModal();
                this_.props.componentDidMount(true);
                showToast(childAddedSuccess[languageCode], 5000, toastTypes.SUCCESS);
              }
            });
        }
      }

    }

  }

  checkUniqueChildName(){
    const nameToAdd = this.state.educando[studentsParameters.NAME[languageCode]];
    const localUser = JSON.parse(window.localStorage.getItem("userDoc"));
    const nameDesignation = studentsParameters.NAME[languageCode];
    const educandos = filterDeletedEducandosArray(localUser[parentsParameters.CHILDREN[languageCode]]);

    const names = [];
    for (let i in educandos){
      const educando = educandos[i];
      const currentName = educando[nameDesignation];
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
    //console.log("state no valid 1: " + JSON.stringify(this.state));
    // remove all feedbacks at the beginning
    this.resetFeedbacks();

    //console.log("state no valid 2: " + JSON.stringify(this.state));
    // check if all inputs are filled
    let changedFeedbacks = {...this.state.feedbacks};
    let allFilled = true;

    for(let field in this.state.feedbacks){
      const value = this.state.educando[field];
      //console.log(field + " : " + value);
      if(value==null || value.trim()===""){
        //console.log("entrei com " + field + " a " + value);
        //console.log("passar de  " + changedFeedbacks[field] + " a true");
        changedFeedbacks[field] = true;
        allFilled = false;
      }
    }
    //console.log("changedFeedbacks no valid: " + JSON.stringify(changedFeedbacks));
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
    // update the param with the new value
    educando[paramName] = e.target.value;
    this.setState({ educando: educando });
  }

  showModal() {
    this.setState({ show: true });
    this.enableCreateButtonAndInputs(); // just in case
  }

  closeModal() {
    this.resetState();
    this.setState({ show: false });
    this.enableCreateButtonAndInputs();
  }

  resetState(){
    this.setState(this.initial);
  }


  disableCreateButtonAndInputs(){
    this.setState({ onCreateButtonDisabled: true });
    this.setState({ disabled: true });
  }

  enableCreateButtonAndInputs(){
    this.setState({ onCreateButtonDisabled: false });
    this.setState({ disabled: false });
  }



  renderExtra() {
    let extraInputs = [];
    const childParamsTypes = this.state.newParamsTypesN[newParametersEntities.student[languageCode]];

    if(childParamsTypes!=null) { // is null when there are no child parameters
      for (let param in childParamsTypes) {

        const idx = "child" + param;
        const type = childParamsTypes[param].type;
        const step = childParamsTypes[param].step;

        // add feedback control variable
        let updatedFeedbacks = {...this.state.feedbacks};
        updatedFeedbacks[param] = false;
        this.state.feedbacks = updatedFeedbacks;
        const feedbackIdx = "child" + param + "Feedback";

        //console.log("state com nova feedback entry -> " + JSON.stringify(this.state));

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
              invalid={this.state.feedbacks[param]}
              required
              disabled={this.state.disabled ? "disabled" : ""}
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
                    <div style={{
                      width : "110px",
                      height: "110px",
                      backgroundImage: "url(" + this.state.educandoFoto + ")",
                      backgroundPosition : "center",
                      borderRadius: "50%",
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat"
                    }}>
                    </div>
                  </Row>
                  <div style={{ margin: "10px" }} />
                  <Row
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
                        id="add-photo-button-new-child"
                        disabled={this.state.onCreateButtonDisabled}
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
                        onChange={this.handleChangePhoto}
                        disabled={this.state.disabled ? "disabled" : ""}/>
                    </Row>
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
                        value={this.state.educando[studentsParameters.SCHOOL_YEAR[languageCode]]}
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
            <Button variant="primary" onClick={this.addEducando} disabled={this.state.onCreateButtonDisabled}>
              {submitChild[languageCode]}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}


export default NewEducandoModal;

/* eslint jsx-a11y/anchor-is-valid: 0 */

import React, {Component as SidebarMainNavbar} from "react";
import Modal from "react-bootstrap/Modal";
import {
  Button,
  Col,
  Row,
} from "shards-react";
import {
  assocParameters,
  defaultAvatar,
  languageCode, parentsParameters, showToast,
  toastTypes,
} from "../../utils/general_utils";
import {
  cancel,
  saveChanges
} from "../../utils/common_strings";
import {
  newAssocLogoModalTitle,
  newProfilePhoto
} from "../../utils/page_titles_strings";
import {
  updateParent, uploadAssocLogo,
  uploadProfilePhoto
} from "../../firebase_scripts/profile_functions";
import {
  assocDataUpdateSuccess, assocUpdateLogoError, assocUpdateLogoSuccess,
  parentUpdatePhotoError, parentUpdatePhotoSuccess,
} from "../../utils/messages_strings";
import {firebase_auth, storage, storageRef} from "../../firebase-config";
import {
  getAssocDoc,
  updateAssocDoc
} from "../../firebase_scripts/get_assoc_info";

class AssocLogoModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      newPhoto : this.props.photo,
      originalPhoto : this.props.photo,
      fileToUpload : null,
      onSavePhotoButtonsDisabled : false
    };

    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChangePhoto = this.handleChangePhoto.bind(this);
    this.restoreOriginalPhoto = this.restoreOriginalPhoto.bind(this);
    this.closeModalAfterUpdate = this.closeModalAfterUpdate.bind(this);
    this.updatePhoto = this.updatePhoto.bind(this);
    this.setNewPhoto = this.setNewPhoto.bind(this);

    this.enableButtonsWhileUpdating = this.enableButtonsWhileUpdating.bind(this);
    this.disableButtonsWhileUpdating = this.disableButtonsWhileUpdating.bind(this);

  }

  updatePhoto(){
    const this_ = this;
    this_.disableButtonsWhileUpdating();
    //console.log("state antes do update: " + JSON.stringify(this.state));

    // if the photo is the same, do nothing
    if(this.state.newPhoto===this_.state.originalPhoto){
      this.closeModal();
      return;
    }

    const originalPhotoURL = this_.state.originalPhoto;
    const newPhotoFile = this_.state.fileToUpload;

    const closeModalAfterTheUpdate = this_.closeModalAfterUpdate;
    const myComponentDidMount = this_.props.componentDidMount;
    const setNewPhotoOnState = this_.setNewPhoto;
    const restorePhoto = this_.restoreOriginalPhoto;

    /*
    * this will catch the error of trying to get the reference for the
    * defaultAvatar reference, which does not exist
    * */
    try{
      let previousPhotoRef = storage.refFromURL(originalPhotoURL);
      // delete current photo to save the new and not cluttering the storage
      previousPhotoRef.delete()
        .then(() => {
          const uploadTask = uploadAssocLogo(newPhotoFile);
          uploadTask
            .then((snapshot) => {
              // Handle successful uploads on complete
              // get the download URL
              snapshot.ref.getDownloadURL().then(function (downloadURL) {
                const newLogoField = {[assocParameters.LOGO[languageCode]] : downloadURL};

                updateAssocDoc(newLogoField)
                  .then(() => {
                    getAssocDoc()
                      .then(doc => {
                        if (!doc.exists) {
                          console.log('No assotiation document found!');
                        }
                        else {
                          const assocDataString = JSON.stringify(doc.data());
                          console.log("assocData recebida depois do update foto -> " + assocDataString);
                          // update assoc data in localstorage
                          window.localStorage.setItem("assocDoc", assocDataString);
                          closeModalAfterTheUpdate();
                          myComponentDidMount(true);
                          setNewPhotoOnState(downloadURL);
                          // TODO: update navbar instantaneously with logo
                          showToast(assocUpdateLogoSuccess[languageCode], 5000, toastTypes.SUCCESS);
                        }
                      })
                      .catch(err => {
                        console.log('Error getting document', err);
                      });
                  })
                  .catch((error) => {
                    if(Object.keys(error).length!==0){
                      console.log("update error: " + JSON.stringify(error));
                      showToast(assocUpdateLogoError[languageCode], 5000, toastTypes.ERROR);
                      restorePhoto();
                      this_.enableButtonsWhileUpdating();
                    }
                  });

              });
            })
            .catch((error) => {
              console.log("Logo upload failed: " + JSON.stringify(error));
              showToast(assocUpdateLogoError[languageCode], 5000, toastTypes.ERROR);
              this_.restoreOriginalPhoto();
              this_.enableButtonsWhileUpdating();
            });
        })
        .catch(() => {
          console.log("erro no delete");
          showToast(assocUpdateLogoError[languageCode], 5000, toastTypes.ERROR);
          this.restoreOriginalPhoto();
          this_.enableButtonsWhileUpdating();
        });
    }
    catch (e) {
      const uploadTask = uploadAssocLogo(newPhotoFile);
      uploadTask
        .then((snapshot) => {
          // Handle successful uploads on complete
          // get the download URL
          snapshot.ref.getDownloadURL().then(function (downloadURL) {
            const newLogoField = {[assocParameters.LOGO[languageCode]] : downloadURL};

            updateAssocDoc(newLogoField)
              .then(() => {
                getAssocDoc()
                  .then(doc => {
                    if (!doc.exists) {
                      console.log('No assotiation document found!');
                    }
                    else {
                      const assocDataString = JSON.stringify(doc.data());
                      console.log("assocData recebida depois do update foto -> " + assocDataString);
                      // update assoc data in localstorage
                      window.localStorage.setItem("assocDoc", assocDataString);
                      closeModalAfterTheUpdate();
                      myComponentDidMount(true);
                      setNewPhotoOnState(downloadURL);
                      // TODO: update navbar instantaneously with logo
                      showToast(assocUpdateLogoSuccess[languageCode], 5000, toastTypes.SUCCESS);
                    }
                  })
                  .catch(err => {
                    console.log('Error getting document', err);
                  });
              })
              .catch((error) => {
                if(Object.keys(error).length!==0){
                  console.log("update error: " + JSON.stringify(error));
                  showToast(assocUpdateLogoError[languageCode], 5000, toastTypes.ERROR);
                  restorePhoto();
                  this_.enableButtonsWhileUpdating();
                }
              });

          });
        })
        .catch((error) => {
          console.log("Logo upload failed: " + JSON.stringify(error));
          showToast(assocUpdateLogoError[languageCode], 5000, toastTypes.ERROR);
          this_.restoreOriginalPhoto();
          this_.enableButtonsWhileUpdating();
        });
    }

  }


  handleChangePhoto(e) {
    const imageFile = e.target.files[0];
    if(imageFile!=null){
      const imageTempUrl = URL.createObjectURL(imageFile);
      this.setState({fileToUpload : imageFile, newPhoto : imageTempUrl});
    }
  }


  showModal() {
    this.enableButtonsWhileUpdating();
    this.setState({ show: true });
  }

  closeModal() {
    this.restoreOriginalPhoto();
    this.setState({ show: false });
    this.enableButtonsWhileUpdating();
  }

  closeModalAfterUpdate() {
    this.setState({ show: false , fileToUpload : null});
    this.enableButtonsWhileUpdating();
  }


  restoreOriginalPhoto() {
    const originalPhoto = this.state.originalPhoto;
    this.setState({ newPhoto: originalPhoto });
  }


  setNewPhoto(newPhotoURL){
    this.setState({ originalPhoto: newPhotoURL });
    this.setState({ newPhoto: newPhotoURL });
  }

  disableButtonsWhileUpdating(){
    this.setState({ onSavePhotoButtonsDisabled: true });
  }

  enableButtonsWhileUpdating(){
    this.setState({ onSavePhotoButtonsDisabled: false });
  }


  render() {
    return (
      <>
        <Button
          size="sm"
          theme="light"
          id="new_logo"
          onClick={this.showModal}
        >
          <span className="material-icons md-24">add_a_photo</span>
        </Button>


        <Modal show={this.state.show} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {newAssocLogoModalTitle[languageCode]}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Col>
              <Row
                style={{
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{
                  width : "100%",
                  height: "110px",
                  backgroundImage: "url(" + this.state.newPhoto + ")",
                  backgroundPosition : "center",
                  borderRadius: "2%",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
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
                    id="add-photo-button"
                    disabled={this.state.onSavePhotoButtonsDisabled}
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
                    disabled={this.state.onSavePhotoButtonsDisabled}/>
                </Row>
              </Row>
            </Col>
          </Modal.Body>

          <Modal.Footer
            style={{ justifyContent: "left", flexDirection: "column" }}
          >
            <Row>
              <Button style={{marginRight:"40px"}} theme="danger" onClick={this.closeModal} disabled={this.state.onSavePhotoButtonsDisabled}>
                {cancel[languageCode]}
              </Button>
              <Button style={{marginLeft:"40px"}} className="float-right" theme="success" onClick={this.updatePhoto} disabled={this.state.onSavePhotoButtonsDisabled}>
                {saveChanges[languageCode]}
              </Button>
            </Row>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default AssocLogoModal;

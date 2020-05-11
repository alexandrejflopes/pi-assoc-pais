/* eslint jsx-a11y/anchor-is-valid: 0 */

import React from "react";
import Modal from "react-bootstrap/Modal";
import {
  Button,
  Col,
  Row,
} from "shards-react";
import {
  defaultAvatar,
  languageCode, parentsParameters, showToast,
  toastTypes,
} from "../../utils/general_utils";
import {
  cancel,
  saveChanges
} from "../../utils/common_strings";
import {newProfilePhoto} from "../../utils/page_titles_strings";
import {
  updateParent,
  uploadProfilePhoto
} from "../../firebase_scripts/profile_functions";
import {
  parentUpdatePhotoError, parentUpdatePhotoSuccess,
} from "../../utils/messages_strings";
import {firebase_auth, storage, storageRef} from "../../firebase-config";

class ParentPhotoModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      newPhoto : this.props.photo,
      originalPhoto : this.props.photo,
      fileToUpload : null
    };

    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChangePhoto = this.handleChangePhoto.bind(this);
    this.restoreOriginalPhoto = this.restoreOriginalPhoto.bind(this);
    this.closeModalAfterUpdate = this.closeModalAfterUpdate.bind(this);
    this.updatePhoto = this.updatePhoto.bind(this);
    this.setNewPhoto = this.setNewPhoto.bind(this);

  }

  updatePhoto(){

    //console.log("state antes do update: " + JSON.stringify(this.state));

    // if the photo is the same, do nothing
    if(this.state.newPhoto===this.state.originalPhoto){
      this.closeModal();
      return;
    }

    const originalPhotoURL = this.state.originalPhoto;
    const newPhotoFile = this.state.fileToUpload;

    const closeModalAfterTheUpdate = this.closeModalAfterUpdate;
    const myComponentDidMount = this.props.componentDidMount;
    const setNewPhotoOnState = this.setNewPhoto;
    const restorePhoto = this.restoreOriginalPhoto;

    /*
    * this will catch the error of trying to get the reference for the
    * defaultAvatar reference, which does not exist
    * */
    try{
      let previousPhotoRef = storage.refFromURL(originalPhotoURL);
      // delete current photo to save the new and not cluttering the storage
      previousPhotoRef.delete()
        .then(() => {
          const uploadTask = uploadProfilePhoto(newPhotoFile);
          uploadTask
            .then((snapshot) => {
              // Handle successful uploads on complete
              // get the download URL
              snapshot.ref.getDownloadURL().then(function (downloadURL) {
                const newPhotoField = {[parentsParameters.PHOTO[languageCode]] : downloadURL};

                updateParent(firebase_auth.currentUser.email, newPhotoField)
                  .then((updatedParent) => {
                    const upParentString = JSON.stringify(updatedParent);
                    //console.log("updatedParent recebido depois do update foto -> " + upParentString);
                    // update user data in localstorage
                    window.localStorage.setItem("userDoc", upParentString);
                    closeModalAfterTheUpdate();
                    myComponentDidMount(true);
                    setNewPhotoOnState(downloadURL);
                    // TODO: update navbar instantaneously
                    showToast(parentUpdatePhotoSuccess[languageCode], 5000, toastTypes.SUCCESS);
                  })
                  .catch((error) => {
                    if(Object.keys(error).length!==0){
                      console.log("update error: " + JSON.stringify(error));
                      showToast(parentUpdatePhotoError[languageCode], 5000, toastTypes.ERROR);
                      restorePhoto();
                    }
                  });

              });
            })
            .catch((error) => {
              console.log("Logo upload failed: " + JSON.stringify(error));
              showToast(parentUpdatePhotoError[languageCode], 5000, toastTypes.ERROR);
              this.restoreOriginalPhoto();
            });
        })
        .catch(() => {
          console.log("erro no delete");
          showToast(parentUpdatePhotoError[languageCode], 5000, toastTypes.ERROR);
          this.restoreOriginalPhoto();
        });
    }
    catch (e) {
      const uploadTask = uploadProfilePhoto(newPhotoFile);
      uploadTask
        .then((snapshot) => {
          // Handle successful uploads on complete
          // get the download URL
          snapshot.ref.getDownloadURL().then(function (downloadURL) {
            const newPhotoField = {[parentsParameters.PHOTO[languageCode]] : downloadURL};

            updateParent(firebase_auth.currentUser.email, newPhotoField)
              .then((updatedParent) => {
                const upParentString = JSON.stringify(updatedParent);
                console.log("updatedParent recebido depois do update foto -> " + upParentString);
                // update user data in localstorage
                window.localStorage.setItem("userDoc", upParentString);
                closeModalAfterTheUpdate();
                myComponentDidMount(true);
                setNewPhotoOnState();
                // TODO: update navbar instantaneously
                showToast(parentUpdatePhotoSuccess[languageCode], 5000, toastTypes.SUCCESS);
              })
              .catch((error) => {
                if(Object.keys(error).length!==0){
                  console.log("update error: " + JSON.stringify(error));
                  showToast(parentUpdatePhotoError[languageCode], 5000, toastTypes.ERROR);
                  restorePhoto();
                }
              });

          });
        })
        .catch((error) => {
          console.log("Photo upload failed: " + JSON.stringify(error));
          showToast(parentUpdatePhotoError[languageCode], 5000, toastTypes.ERROR);
          this.restoreOriginalPhoto();
        });
    }

  }


  handleChangePhoto(e) {
    const imageFile = e.target.files[0];
    const imageTempUrl = URL.createObjectURL(imageFile);
    this.setState({fileToUpload : imageFile, newPhoto : imageTempUrl});
  }


  showModal() {
    this.setState({ show: true });
  }

  closeModal() {
    this.restoreOriginalPhoto();
    this.setState({ show: false });
  }

  closeModalAfterUpdate() {
    this.setState({ show: false , fileToUpload : null});
  }


  restoreOriginalPhoto() {
    const originalPhoto = this.state.originalPhoto;
    this.setState({ newPhoto: originalPhoto });
    //console.log("first photo restored: " + JSON.stringify(originalPhoto));
  }


  setNewPhoto(newPhotoURL){
    this.setState({ originalPhoto: newPhotoURL });
    this.setState({ newPhoto: newPhotoURL });
  }


  render() {
    //console.log("state a render -> " + JSON.stringify(this.state));
    return (
      <>
        <Button
          size="sm"
          theme="light"
          id="new_case"
          onClick={this.showModal}
        >
          <span className="material-icons md-24">add_a_photo</span>
        </Button>


        <Modal show={this.state.show} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {newProfilePhoto[languageCode]}
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
                  width : "110px",
                  height: "110px",
                  backgroundImage: "url(" + this.state.newPhoto + ")",
                  backgroundPosition : "center",
                  borderRadius: "50%",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat"
                }}>
                </div>
                {/*
                  <img
                    className="rounded-circle img-fluid"
                    src={
                      this.state.newPhoto
                    }
                    width="110"
                  />
                */}
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
              </Row>
            </Col>
          </Modal.Body>

          <Modal.Footer
            style={{ justifyContent: "left", flexDirection: "column" }}
          >
            <Row>
              <Button style={{marginRight:"40px"}} theme="danger" onClick={this.closeModal}>
                {cancel[languageCode]}
              </Button>
              <Button style={{marginLeft:"40px"}} className="float-right" theme="success" onClick={this.updatePhoto}>
                {saveChanges[languageCode]}
              </Button>
            </Row>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default ParentPhotoModal;

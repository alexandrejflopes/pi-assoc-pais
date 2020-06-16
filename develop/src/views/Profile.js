import React from "react";
import { Container, Row, Col } from "shards-react";

import PageTitle from "../components/common/PageTitle";
import UserOverview from "../components/profile/UserOverview";
import UserInfo from "../components/profile/UserInfo";
import { Redirect } from "react-router-dom";
import {
  fetchUserDoc,
  getNewParams,
  mapParamsToInputType, updateParent,
} from "../firebase_scripts/profile_functions";
import { firebase_auth } from "../firebase-config";
import {
  defaultAvatar,
  languageCode,
  parentsParameters, showToast, toastTypes
} from "../utils/general_utils";
import { profilePageTitle } from "../utils/page_titles_strings";
import {
  loadingInfo,
  parentUpdatePhotoError,
  parentUpdatePhotoSuccess
} from "../utils/messages_strings";
import UserActions from "../components/layout/MainNavbar/NavbarNav/UserActions";
import {getAssocDoc} from "../firebase_scripts/get_assoc_info";

class Profile extends React.Component {
  constructor(props) {
    super(props);

    let userEmail, userProvided, assoc = null;
    if (this.props.location.state != null) {
      userEmail = this.props.location.state.userEmail;
      userProvided = this.props.location.state.userProvided;
    } else {
      if (window.localStorage.getItem("email") != null) {
        userEmail = window.localStorage.getItem("email");
        userProvided = true;
      }
    }

    this.state = {
      userEmail: userEmail,
      userProvided: userProvided != null ? userProvided : false,
      userDoc: null,
      editingProfile: false,
      newParamsInputTypes: null,
      assocDoc : assoc,
    };


    this.saveNewParams = this.saveNewParams.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.setupAssocDoc = this.setupAssocDoc.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/

  componentDidMount(updating) {

    const this_ = this;
    //this._isMounted = true;

    if(updating){
      console.log("atualizar Profile.js");
      const localUser = JSON.parse(window.localStorage.getItem("userDoc"));

      if(localUser!=null){
        this_.setState({userDoc : localUser}, () => this_.render());
      }

      const localAssocDoc = JSON.parse(window.localStorage.getItem("assocDoc"));
      if(localAssocDoc!=null){
        this_.setState({assocDoc: localAssocDoc});
      }

    }


    else{
      //console.log("DID MOUNT!");
      const currentUser = firebase_auth.currentUser;
      const localUser = JSON.parse(window.localStorage.getItem("userDoc"));
      //console.log("localuser -> " + JSON.stringify(localUser));

      if(currentUser!=null){
        if(localUser!=null){
          if (localUser[parentsParameters.EMAIL[languageCode]] !== firebase_auth.currentUser.email) {
            const userPromise = fetchUserDoc(this_.state.userEmail);

            userPromise
              .then((result) => {
                //console.log("1. Result userDoc: " + JSON.stringify(result));
                if (result.error == null) {
                  // no error
                  //console.log("atualizar state com user doc recebido");
                  this_.setState({ userDoc: result });
                  window.localStorage.setItem("userDoc", JSON.stringify(result));
                  UserActions.componentDidMount();
                  this_.saveNewParams();
                }
              })
              .catch((error) => {
                console.log("error userDoc: " + JSON.stringify(error));
                this_.componentDidMount();
              });
          }
          else {
            //console.log("atualizar state com localUser");
            this_.saveNewParams();
            this_.setState({ userDoc: localUser });
          }
        }
        else {
          //console.log("não há user no LS, buscar novo");
          const userPromise = fetchUserDoc(this_.state.userEmail);

          userPromise
            .then((result) => {
              //console.log("2. Result userDoc: " + JSON.stringify(result));
              if (result.error == null) {

                // TODO: check
                let parent = result;
                const currentUserPhoto = currentUser.photoURL;
                const resultUserPhoto = parent[parentsParameters.PHOTO[languageCode]];

                if(currentUserPhoto!=null){
                  if(currentUserPhoto!==resultUserPhoto){
                    parent[parentsParameters.PHOTO[languageCode]] = currentUserPhoto;
                    const photoField = {[parentsParameters.PHOTO[languageCode]] : currentUserPhoto};
                    updateParent(currentUser.email, photoField)
                      .then(() => {
                        //console.log("updated parent with provider photo in DB")
                      })
                      .catch((error) => {
                        if(Object.keys(error).length!==0){
                          //console.log("update error: " + JSON.stringify(error));
                        }
                      });
                  }
                }
                // ----------------------------------------------------------------------

                // no error
                //console.log("atualizar state com user doc recebido");
                //console.log("parent com foto do provider -> " + JSON.stringify(parent));
                this_.setState({ userDoc: parent });

                window.localStorage.setItem("userDoc", JSON.stringify(parent));
                this_.saveNewParams();
                UserActions.componentDidMount();
              }
            })
            .catch((error) => {
              //console.log("2. error userDoc: " + JSON.stringify(error));
              this_.componentDidMount();
            });
        }
      }

      this_.setupAssocDoc();
    }



}


  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/

  setupAssocDoc(){
    const localAssocDoc = JSON.parse(window.localStorage.getItem("assocDoc"));
    if(localAssocDoc!=null){
      this.setState({assocDoc: localAssocDoc});
    }
    else{
      const promise = getAssocDoc();
      promise
        .then(doc => {
          if (!doc.exists) {
            //console.log('No assotiation document found!');
          }
          else {
            const data = doc.data();
            window.localStorage.setItem("assocDoc", JSON.stringify(data));
            this.setState({
              assocDoc: localAssocDoc
            });
          }
        })
        .catch(err => {
          console.log('Error getting document', err);
        });
    }
  }

  saveNewParams() {
    //console.log("entrei nos newParamsTypes");
    const newParamsInputTypes = JSON.parse(window.localStorage.getItem("newParamsInputTypes"));
    //console.log("newParamsTypes no LS: " + JSON.stringify(newParamsInputTypes));
    if (newParamsInputTypes != null) {
      //console.log("recebi newParamsTypes: " + JSON.stringify(newParamsInputTypes));
      this.setState({ newParamsInputTypes: newParamsInputTypes });
    }
    else {
      const paramsPromise = getNewParams(this.state.userEmail);

      paramsPromise
        .then((result) => {
          //console.log("Result paramsDoc: " + JSON.stringify(result));
          if (result.error == null) {
            // no error
            const newParamsInputTypes = mapParamsToInputType(result);
            this.setState({ newParamsInputTypes: newParamsInputTypes });

            //console.log("newParamsTypes do LocalStorage: " + JSON.stringify(newParamsInputTypes));
            window.localStorage.setItem("newParamsInputTypes", JSON.stringify(newParamsInputTypes));
          }
        })
        .catch((error) => {
          //console.log("error paramsDoc: " + JSON.stringify(error));
        });
    }
  }

  render() {
    if (this.state.userEmail == null || !this.state.userProvided || firebase_auth.currentUser == null) {
      return <Redirect to="/login" />;
    }
    else if (this.state.userDoc == null || Object.keys(this.state.userDoc).length === 0 || this.state.newParamsInputTypes == null) {
      return (
        <Container fluid className="main-content-container px-4">
          <Row noGutters className="page-header py-4">
            <PageTitle
              title={profilePageTitle[languageCode]}
              md="12"
              className="ml-sm-auto mr-sm-auto"
            />
          </Row>
          <Row
            fluid
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <h2>{loadingInfo[languageCode]}</h2>
          </Row>
        </Container>
      );
    } else {
      return (
        <Container fluid className="main-content-container px-4">
          <Row noGutters className="page-header py-4">
            <PageTitle
              title={profilePageTitle[languageCode]}
              md="12"
              className="ml-sm-auto mr-sm-auto"
            />
          </Row>
          <Row>
            <Col lg="4">
              <UserOverview
                user={this.state.userDoc}
                newParamsTypes={this.state.newParamsInputTypes}
                componentDidMount={this.componentDidMount}
              />
            </Col>
            <Col lg="8">
              <UserInfo
                userD={this.state.userDoc}
                newParamsTypesD={this.state.newParamsInputTypes}
                componentDidMount={this.componentDidMount}
              />
            </Col>
          </Row>
        </Container>
      );
    }
  }
}

export default Profile;

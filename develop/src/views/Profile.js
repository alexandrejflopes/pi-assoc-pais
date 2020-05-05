import React from "react";
import { Container, Row, Col } from "shards-react";

import PageTitle from "../components/common/PageTitle";
import UserOverview from "../components/profile/UserOverview";
import UserInfo from "../components/profile/UserInfo";
import {Redirect} from "react-router-dom";
import {
  fetchUserDoc,
  getNewParams, mapParamsToInputType
} from "../firebase_scripts/profile_functions";
import {firebase_auth} from "../firebase-config";
import {languageCode, parentsParameters} from "../utils/general_utils";
import {profilePageTitle} from "../utils/page_titles_strings";
import {loadingInfo} from "../utils/messages_strings";
import UserActions from "../components/layout/MainNavbar/NavbarNav/UserActions";

class Profile extends React.Component {

  constructor(props) {
    super(props);

    let userEmail, userProvided = null;
    if(this.props.location.state!=null){
      userEmail = this.props.location.state.userEmail;
      userProvided = this.props.location.state.userProvided
    }

    this.state = {
      userEmail : userEmail,
      userProvided : userProvided != null ? userProvided : false,
      userDoc : null,
      editingProfile : false,
      newParamsInputTypes : null
    };

    //this.componentDidMount = this.componentDidMount.bind(this);
    this.saveNewParams = this.saveNewParams.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;
    console.log("DID MOUNT!");

    if(firebase_auth.currentUser!=null){
      console.log("currentUser: " + JSON.stringify(firebase_auth.currentUser));
      console.log("localUser: " + JSON.stringify(JSON.parse(window.localStorage.getItem("userDoc"))));
      if(window.localStorage.getItem("userDoc")!=null){
        let localUser = JSON.parse(window.localStorage.getItem("userDoc"));

        if(localUser[parentsParameters.EMAIL[languageCode]]!==firebase_auth.currentUser.email){
          const userPromise = fetchUserDoc(this.state.userEmail);

          userPromise
            .then((result) => {
              console.log("Result userDoc: " + JSON.stringify(result));
              if(result.error == null){ // no error
                console.log("atualizar state com user doc recebido");
                this.setState({ userDoc: result });
                window.localStorage.setItem("userDoc", JSON.stringify(result));
                UserActions.componentDidMount();
                this.saveNewParams();
              }

            })
            .catch((error) => {
              console.log("error userDoc: " + JSON.stringify(error));
            });
        }
        else{
          console.log("atualizar state com localUser");
          this.saveNewParams();
          this.setState({ userDoc: localUser });
        }
      }
      else{
        console.log("não há user no LS, buscar novo");
        const userPromise = fetchUserDoc(this.state.userEmail);

        userPromise
          .then((result) => {
            console.log("Result userDoc: " + JSON.stringify(result));
            if(result.error == null){ // no error
              console.log("atualizar state com user doc recebido");
              this.setState({ userDoc: result });
              window.localStorage.setItem("userDoc", JSON.stringify(result));
              UserActions.componentDidMount();
              this.saveNewParams();
            }

          })
          .catch((error) => {
            console.log("error userDoc: " + JSON.stringify(error));
          });
      }
    }

  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  /*********************************** HANDLERS ***********************************/

  saveNewParams(){
    console.log("entrei nos newParamsTypes");
    if(window.localStorage.getItem("newParamsInputTypes")!=null){
      const newParamsInputTypes = JSON.parse(window.localStorage.getItem("newParamsInputTypes"));
      console.log("recebi newParamsTypes: " + JSON.stringify(newParamsInputTypes));
      this.setState({ newParamsInputTypes: newParamsInputTypes });
    }
    else{
      const paramsPromise = getNewParams(this.state.userEmail);

      paramsPromise
        .then((result) => {
          console.log("Result paramsDoc: " + JSON.stringify(result));
          if(result.error == null){ // no error
            const newParamsInputTypes = mapParamsToInputType(result);
            this.setState({ newParamsInputTypes: newParamsInputTypes });

            console.log("newParamsTypes do LocalStorage: " + JSON.stringify(newParamsInputTypes));
            window.localStorage.setItem("newParamsInputTypes", JSON.stringify(newParamsInputTypes));
          }
        })
        .catch((error) => {
          console.log("error paramsDoc: " + JSON.stringify(error));
        });
    }
  }


  render(){
    if(this.state.userEmail == null || !this.state.userProvided || firebase_auth.currentUser == null){
      return <Redirect to="/login" />;
    }
    else if(this.state.userDoc == null || Object.keys(this.state.userDoc).length===0 || this.state.newParamsInputTypes == null){
      return(
        <Container fluid className="main-content-container px-4">
          <Row noGutters className="page-header py-4">
            <PageTitle title="O meu perfil" md="12" className="ml-sm-auto mr-sm-auto" />
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
    }
    else {
      return(
        <Container fluid className="main-content-container px-4">
          <Row noGutters className="page-header py-4">
            <PageTitle title={profilePageTitle[languageCode]} md="12" className="ml-sm-auto mr-sm-auto" />
          </Row>
          <Row>
            <Col lg="4">
              <UserOverview user = {this.state.userDoc} newParamsTypes = {this.state.newParamsInputTypes} />
            </Col>
            <Col lg="8">
              <UserInfo userD = {this.state.userDoc} newParamsTypesD = {this.state.newParamsInputTypes} />
            </Col>
          </Row>
        </Container>
      );
    }

  }

}

export default Profile;

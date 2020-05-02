import React from "react";
import { Container, Row, Col } from "shards-react";

import PageTitle from "../components/common/PageTitle";
import UserOverview from "../components/profile/UserOverview";
import UserInfo from "../components/profile/UserInfo";
import {Redirect} from "react-router-dom";
import {fetchUserDoc} from "../firebase_scripts/profile_functions";
import {firebase_auth} from "../firebase-config";

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
      editingProfile : false
    }

    //this.componentDidMount = this.componentDidMount.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

    const userPromise = fetchUserDoc(this.state.userEmail);

    userPromise
      .then((result) => {
      //console.log("Result userDoc: " + JSON.stringify(result));
      if(result.error == null){
        //console.log("atualizar state com user doc recebido");
        this.setState({ userDoc: result });
      }

    })
      .catch((error) => {
        console.log("error userDoc: " + JSON.stringify(error));
      });

  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  /*********************************** HANDLERS ***********************************/




  render(){
    if(this.state.userEmail == null || !this.state.userProvided || firebase_auth.currentUser == null){
      return <Redirect to="/login" />;
    }
    else if(this.state.userDoc == null || Object.keys(this.state.userDoc).length===0){
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
            <h2>A carregar informações...</h2>
          </Row>
        </Container>
      );
    }
    else {
      return(
        <Container fluid className="main-content-container px-4">
          <Row noGutters className="page-header py-4">
            <PageTitle title="O meu perfil" md="12" className="ml-sm-auto mr-sm-auto" />
          </Row>
          <Row>
            <Col lg="4">
              <UserOverview user = {this.state.userDoc} />
            </Col>
            <Col lg="8">
              <UserInfo userD = {this.state.userDoc} />
            </Col>
          </Row>
        </Container>
      );
    }

  }

}

export default Profile;

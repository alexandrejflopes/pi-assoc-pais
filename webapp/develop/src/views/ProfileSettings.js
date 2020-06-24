import React from "react";
import {Container, Row, Col, Button, DropdownItem} from "shards-react";

import PageTitle from "../components/common/PageTitle";
import {Link, Redirect} from "react-router-dom";
import { firebase_auth } from "../firebase-config";
import { languageCode, parentsParameters } from "../utils/general_utils";
import {
  goBackToProfile, profileSettingsAdminSectionTitle,
  profileSettingsPageTitle
} from "../utils/page_titles_strings";
import { loadingInfo } from "../utils/messages_strings";
import AdvancedSettings from "../components/profile/AdvancedSettings";
import LinkProviders from "../components/profile/LinkProviders";
import ExportProfile from "../components/profile/ExportProfile";
import DeleteAccount from "../components/profile/DeleteAccount";

class ProfileSettings extends React.Component {
  constructor(props) {
    super(props);

    const localUser = JSON.parse(window.localStorage.getItem("userDoc"));

    let userEmail = null;
    let userDoc = null;

    if(localUser!=null){
      userEmail = localUser[parentsParameters.EMAIL[languageCode]];
      userDoc = localUser;
    }

    this.state = {
      userEmail: userEmail,
      userDoc: userDoc
    };


    this.componentDidMount = this.componentDidMount.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount(updating) {
    //this._isMounted = true;

    if(updating){
      const localUser = JSON.parse(window.localStorage.getItem("userDoc"));
      if(localUser!=null){
        this.setState({userDoc : localUser});
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/



  render() {

    if (this.state.userEmail == null || firebase_auth.currentUser == null) {
      return <Redirect to="/login" />;
    }
    else if (this.state.userDoc == null || Object.keys(this.state.userDoc).length === 0) {
      return (
        <Container fluid className="main-content-container px-4">
          <Row noGutters className="page-header py-4">
            <PageTitle
              title={profileSettingsPageTitle[languageCode]}
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
              title={profileSettingsPageTitle[languageCode]}
              md="12"
              className="ml-sm-auto mr-sm-auto"
            />
          </Row>
          {/*<Row noGutters className="page-header" style={{ marginTop: "10px", marginBottom: "20px" }}>
            <Button pill tag={Link} to="/profile">&larr; {goBackToProfile[languageCode]}</Button>
          </Row>*/}
          <Row>
            <Col lg="8" md="12">
              <AdvancedSettings
                user={this.state.userDoc}
                componentDidMount={this.componentDidMount}
              />
            </Col>
            <Col lg="4" md="12">
              <LinkProviders
                user={this.state.userDoc}
                componentDidMount={this.componentDidMount}
              />
            </Col>
          </Row>
          <Row>
            <Col lg="6" md="12">
              <ExportProfile
                user={this.state.userDoc}
              />
            </Col>
            <Col lg="6" md="12">
              <DeleteAccount
                user={this.state.userDoc}
              />
            </Col>
          </Row>
        </Container>
      );
    }
  }
}

export default ProfileSettings;

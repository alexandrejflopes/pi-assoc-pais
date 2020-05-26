import React from "react";
import {Container, Row, Col, Button, DropdownItem} from "shards-react";

import PageTitle from "../components/common/PageTitle";
import {Link, Redirect} from "react-router-dom";
import { firebase_auth } from "../firebase-config";
import { languageCode, parentsParameters } from "../utils/general_utils";
import {
  profileSettingsAdminSectionTitle,
  profileSettingsPageTitle
} from "../utils/page_titles_strings";
import { loadingInfo } from "../utils/messages_strings";
import ExportAssocData from "../components/profile/ExportAssocData";
import {getAssocDoc} from "../firebase_scripts/get_assoc_info";
import AssocDataInfo from "../components/profile/AssocDataInfo";

class AdminSettings extends React.Component {
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
      userDoc: userDoc,
      assocDoc : null
    };


      //this.componentDidMount = this.componentDidMount.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

    const localUser = JSON.parse(window.localStorage.getItem("userDoc"));
    if(localUser!=null){
      this.setState({userDoc : localUser});
    }

    console.log("atualizei-me!");
    /*if(updating){
      const localUser = JSON.parse(window.localStorage.getItem("userDoc"));
      if(localUser!=null){
        this.setState({userDoc : localUser});
      }
      const localAssocDoc = JSON.parse(window.localStorage.getItem("assocDoc"));
      if(localAssocDoc!=null){
        this.setState({assocDoc: localAssocDoc});
      }
    }

    else{
      const localAssocDoc = JSON.parse(window.localStorage.getItem("assocDoc"));
      if(localAssocDoc!=null){
        this.setState({assocDoc: localAssocDoc});
      }
      else{
        const promise = getAssocDoc();
        promise
          .then(doc => {
            if (!doc.exists) {
              console.log('No assotiation document found!');
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
    }*/
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/



  render() {
    if (this.state.userEmail == null || firebase_auth.currentUser == null) {
      return <Redirect to="/login" />;
    }
    else if (this.state.userDoc == null || Object.keys(this.state.userDoc).length === 0 /*|| this.state.assocDoc == null*/) {
      return (
        <Container fluid className="main-content-container px-4">
          {/*<Row noGutters className="page-header py-4">
            <PageTitle
              title={profileSettingsAdminSectionTitle[languageCode]}
              md="12"
              className="ml-sm-auto mr-sm-auto"
            />
          </Row>*/}
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
      // if not admin, cannot see the page
      if(!this.state.userDoc[parentsParameters.ADMIN[languageCode]]){
        return <Redirect to="/profile" />;
      }
      else{
        return (
          <Container fluid className="main-content-container px-4">
            <Row noGutters className="page-header py-4">
              <PageTitle
                title={profileSettingsAdminSectionTitle[languageCode]}
                md="12"
                className="ml-sm-auto mr-sm-auto"
              />
            </Row>
            <Row>
              <Col lg="12" md="12">
                <AssocDataInfo
                  //assoc={this.state.assocDoc}
                  //componentDidMount={this.componentDidMount}
                />
              </Col>
            </Row>
            <Row>
              <Col lg="6" md="12">
                <ExportAssocData
                  user={this.state.userDoc}
                />
              </Col>
            </Row>
          </Container>
        );
      }

    }
  }
}

export default AdminSettings;

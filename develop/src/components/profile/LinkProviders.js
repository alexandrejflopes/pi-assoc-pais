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
  changeEmail,
  success_geral,
  error_geral,
  unlinkGoogle,
  unlinkMicrosoft,
  unlinkFacebook
} from "../../utils/common_strings";
import {
  profileSettingsDataFormTitle, profileSettingsProvidersSectionTitle
} from "../../utils/page_titles_strings";
import {
  provideRequiredFieldsMessage,
  confirmUpdateEmail,
  linkAccountError,
  unlinkAccountError
} from "../../utils/messages_strings";
import {firebase, firebase_auth} from "../../firebase-config";


class LinkProviders extends React.Component {
  constructor(props) {
    super(props);

    let parent = null;
    const infoFormTitle = profileSettingsProvidersSectionTitle[languageCode];

    if(this.props.user!=null){
      parent = this.props.user;
    }

    //const {phone, nif, email, name, cc, job, street, city} = this.props.user;
    this.state = {
      title: infoFormTitle,
      parent : parent
    };


    this.googleLink = this.googleLink.bind(this);
    this.facebookLink = this.facebookLink.bind(this);
    this.microsoftLink = this.microsoftLink.bind(this);

    this.googleUnlink = this.googleUnlink.bind(this);
    this.facebookUnlink = this.facebookUnlink.bind(this);
    this.microsofUnlink = this.microsofUnlink.bind(this);

  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/


  googleLink(){
    const provider = new firebase.auth.GoogleAuthProvider();
      firebase_auth.currentUser.linkWithPopup(provider).then(function(result) {
        showToast(success_geral[languageCode], 3000, toastTypes.SUCCESS);
        var credential = result.credential;
        var user = result.user;
        console.log("link result -> " + JSON.stringify(result));
      }).catch(function(error) {
        console.log("error no link Google: " + error);
        showToast(linkAccountError[languageCode], 6000, toastTypes.ERROR);
      });
  }

  facebookLink(){
    const provider = new firebase.auth.FacebookAuthProvider();
    firebase_auth.currentUser.linkWithPopup(provider).then(function(result) {
      showToast(success_geral[languageCode], 3000, toastTypes.SUCCESS);
      var credential = result.credential;
      var user = result.user;
    }).catch(function(error) {
      console.log("erro no unlink FB -> " + error);
      showToast(linkAccountError[languageCode], 6000, toastTypes.ERROR);
    });
  }

  microsoftLink(){
    const provider = new firebase.auth.OAuthProvider('microsoft.com');
    firebase_auth.currentUser.linkWithPopup(provider).then(function(result) {
      showToast(success_geral[languageCode], 3000, toastTypes.SUCCESS);
    }).catch(function(error) {
      showToast(linkAccountError[languageCode], 6000, toastTypes.ERROR);
    });
  }

  googleUnlink(){
    const user = firebase_auth.currentUser;

    user.unlink('google.com').then(function() {
      showToast(success_geral[languageCode], 3000, toastTypes.SUCCESS);
    }).catch(function(error) {
      console.log("erro no unlink FB -> " + error);
      showToast(unlinkAccountError[languageCode], 6000, toastTypes.ERROR);
    });
  }

  facebookUnlink(){
    const user = firebase_auth.currentUser;

    user.unlink('facebook.com').then(function() {
      showToast(success_geral[languageCode], 3000, toastTypes.SUCCESS);
    }).catch(function(error) {
      console.log("erro no unlink FB -> " + error);
      showToast(unlinkAccountError[languageCode], 6000, toastTypes.ERROR);
    });
  }

  microsofUnlink(){
    const user = firebase_auth.currentUser;

    user.unlink('microsoft.com').then(function() {
      showToast(success_geral[languageCode], 3000, toastTypes.SUCCESS);
    }).catch(function(error) {
      console.log("erro no unlink FB -> " + error);
      showToast(unlinkAccountError[languageCode], 6000, toastTypes.ERROR);
    });
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
              <Col lg="12" md="12" style={{marginBottom: "23px"}}>
                <Button theme="primary" onClick={this.facebookLink}>
                  <i className="fab fa-facebook-f" style={{marginRight: "10px"}}/>Facebook</Button>
                <Button theme="primary" onClick={this.facebookUnlink} style={{float : "right"}}>
                  <i className="fab fa-facebook-f" style={{marginRight: "10px"}}/>{unlinkFacebook[languageCode]}</Button>
              </Col>
              <Col lg="12" md="12" style={{marginBottom: "23px"}}>
                <Button theme="danger" onClick={this.googleLink}>
                  <i className="fab fa-google" style={{marginRight: "10px"}}/>Google</Button>
                <Button theme="danger" onClick={this.googleUnlink} style={{float : "right"}}>
                  <i className="fab fa-google" style={{marginRight: "10px"}}/>{unlinkGoogle[languageCode]}</Button>
              </Col>
              <Col lg="12" md="12">
                <Button theme="success" onClick={this.microsoftLink}>
                  <i className="fab fa-microsoft" style={{marginRight: "10px"}}/>Microsoft</Button>
                <Button theme="success" onClick={this.microsofUnlink} style={{float : "right"}}>
                  <i className="fab fa-microsoft" style={{marginRight: "10px"}}/>{unlinkMicrosoft[languageCode]}</Button>
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>
      </Card>
    );
  }
}





export default LinkProviders;

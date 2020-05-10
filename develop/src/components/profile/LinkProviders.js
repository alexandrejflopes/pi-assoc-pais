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
  changeEmail
} from "../../utils/common_strings";
import {
  profileSettingsDataFormTitle, profileSettingsProvidersSectionTitle
} from "../../utils/page_titles_strings";
import {
  provideRequiredFieldsMessage, confirmUpdateEmail
} from "../../utils/messages_strings";


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


  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/




  render() {
    return (
      <Card small className="mb-4">
        <CardHeader className="border-bottom">
          <h6 className="m-0">{this.state.title}</h6>
        </CardHeader>
        <ListGroup flush>
          <ListGroupItem className="p-3">
            <Row>
              <Col lg="4" md="12" style={{marginBottom: "10px"}}>
                <Button theme="primary" onClick={this.editForm}>
                  <i className="fab fa-facebook-f" style={{marginRight: "10px"}}/>Facebook</Button>
              </Col>
              <Col lg="4" md="12" style={{marginBottom: "10px"}}>
                <Button theme="danger" onClick={this.editForm}>
                  <i className="fab fa-google" style={{marginRight: "10px"}}/>Google</Button>
              </Col>
              <Col lg="4" md="12">
                <Button theme="success" onClick={this.editForm}>
                  <i className="fab fa-microsoft" style={{marginRight: "10px"}}/>Microsoft</Button>
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>
      </Card>
    );
  }
}





export default LinkProviders;

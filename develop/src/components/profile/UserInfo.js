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
  notAvailableDesignation,
  parentsParameters
} from "../../utils/general_utils";
import {saveChanges, cancel, updateProfile} from "../../utils/common_strings";
import {profileInfoFormTitle} from "../../utils/page_titles_strings";


class UserInfo extends React.Component {
  constructor(props) {
    super(props);

    let name, email, phone, job, nif, cc, street, city, zipcode, newParamsTypesD = null;
    const noValueString = notAvailableDesignation[languageCode];
    const infoFormTitle = profileInfoFormTitle[languageCode];

    if(this.props.userD!=null){
      name = this.props.userD[parentsParameters.NAME[languageCode]];
      email = this.props.userD[parentsParameters.EMAIL[languageCode]];
      phone = this.props.userD[parentsParameters.PHONE[languageCode]];
      job = this.props.userD[parentsParameters.JOB[languageCode]];
      nif = this.props.userD[parentsParameters.NIF[languageCode]];
      cc = this.props.userD[parentsParameters.CC[languageCode]];
      street = this.props.userD[parentsParameters.STREET[languageCode]];
      city = this.props.userD[parentsParameters.CITY[languageCode]];
      zipcode = this.props.userD[parentsParameters.ZIPCODE[languageCode]];
      newParamsTypesD = this.props.newParamsTypesD;
    }

    //const {phone, nif, email, name, cc, job, street, city} = this.props.user;
    this.state = {
      title: infoFormTitle,
      editing : false,
      userName : name!=null ? name : noValueString,
      userEmail : email!=null ? email : noValueString,
      userPhone : phone!=null ? phone : noValueString,
      userJob : job!=null ? job : noValueString,
      userNif : nif!=null ? nif : noValueString,
      userCc : cc!=null ? cc : noValueString,
      userStreet : street!=null ? street : noValueString,
      userCity : city!=null ? city : noValueString,
      userZipCode : zipcode!=null ? zipcode : noValueString,
      newParamsTypesD : newParamsTypesD,
      // feedbacks
      nameFeedback : null,
      emailFeedback : null,
      phoneFeedback : null,
      nifFeedback : null,
      streetFeedback : null,
      cityFeedback : null,
      zipcodeFeedback : null,
      editabledInputsIdsSuffixes : [
        "Name", "Email", "Phone", "Job", "Street", "City", "ZipCode", "NIF", "CC"
      ],
      oldValues : {
        Name : "",
        Email : "",
        Phone : "",
        Job : "",
        Street : "",
        City : "",
        ZipCode : "",
        Nif : "",
        Cc : ""
      }
    };

    this.enableEditableInputs = this.enableEditableInputs.bind(this);
    this.disableEditableInputs = this.disableEditableInputs.bind(this);
    this.editForm = this.editForm.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);

  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/

  savePreviousEditableValues() {
    for(let i in this.state.editabledInputsIdsSuffixes){
      const suffix = this.state.editabledInputsIdsSuffixes[i];
      this.state.oldValues[suffix] = this.state["user"+suffix];
    }
  };

  restorePreviousEditableValues() {
    for(let i in this.state.editabledInputsIdsSuffixes){
      const suffix = this.state.editabledInputsIdsSuffixes[i];
      this.state["user"+suffix] = this.state.oldValues[suffix];
    }
  };

  enableEditableInputs(){
    for(let i in this.state.editabledInputsIdsSuffixes){
      const suffix = this.state.editabledInputsIdsSuffixes[i];
      document.getElementById("fe"+suffix).disabled = false;
    }

  }

  disableEditableInputs(){
    for(let i in this.state.editabledInputsIdsSuffixes){
      const suffix = this.state.editabledInputsIdsSuffixes[i];
      document.getElementById("fe"+suffix).disabled = true;
    }

  }

  editForm(){
    this.savePreviousEditableValues();
    this.setState({editing : true});
    this.enableEditableInputs();
  }

  cancelEditing(){
    this.restorePreviousEditableValues();
    this.setState({editing : false});
    this.disableEditableInputs();
    for(let i in this.state.editabledInputsIdsSuffixes){
      const suffix = this.state.editabledInputsIdsSuffixes[i];
      document.getElementById("fe"+suffix).user = this.state["user"+suffix];
    }

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
              <Col>
                <Form>
                  <Row form>
                    {/* First Name */}
                    <Col md="6" className="form-group">
                      <label htmlFor="feName">{parentsParameters.NAME[languageCode]}</label>
                      <FormInput
                        required
                        id="feName"
                        placeholder={parentsParameters.NAME[languageCode]}
                        value={this.state.userName}
                        onChange={e => this.setState({ userName : e.target.value })}
                        disabled
                      />
                    </Col>
                    {/* Email */}
                    <Col md="6" className="form-group">
                      <label htmlFor="feEmail">{parentsParameters.EMAIL[languageCode]}</label>
                      <FormInput
                        required
                        type="email"
                        id="feEmail"
                        placeholder={parentsParameters.EMAIL[languageCode]}
                        value={this.state.userEmail}
                        onChange={e => this.setState({ userEmail : e.target.value })}
                        disabled
                      />
                    </Col>
                  </Row>
                  <Row form>
                    {/* Phone */}
                    <Col md="6" className="form-group">
                      <label htmlFor="fePhone">{parentsParameters.PHONE[languageCode]}</label>
                      <FormInput
                        required
                        type="tel"
                        id="fePhone"
                        placeholder={parentsParameters.PHONE[languageCode]}
                        value={this.state.userPhone}
                        onChange={e => this.setState({ userPhone : e.target.value })}
                        disabled
                      />
                    </Col>
                    {/* Job */}
                    <Col md="6" className="form-group">
                      <label htmlFor="feJob">{parentsParameters.JOB[languageCode]}</label>
                      <FormInput
                        id="feJob"
                        placeholder={parentsParameters.JOB[languageCode]}
                        value={this.state.userJob}
                        onChange={e => this.setState({ userJob : e.target.value })}
                        disabled
                      />
                    </Col>
                  </Row>
                  <hr />
                  <Row form>
                    {/* Address | Street */}
                    <Col md="6" className="form-group">
                      <label htmlFor="feStreet">{parentsParameters.STREET[languageCode]}</label>
                      <FormInput
                        required
                        id="feStreet"
                        placeholder={parentsParameters.STREET[languageCode]}
                        value={this.state.userStreet}
                        onChange={e => this.setState({ userStreet : e.target.value })}
                        disabled
                      />
                    </Col>
                    {/* City */}
                    <Col md="4" className="form-group">
                      <label htmlFor="feCity">{parentsParameters.CITY[languageCode]}</label>
                      <FormInput
                        required
                        id="feCity"
                        placeholder={parentsParameters.CITY[languageCode]}
                        value={this.state.userCity}
                        onChange={e => this.setState({ userCity : e.target.value })}
                        disabled
                      />
                    </Col>
                    {/* Zip Code */}
                    <Col md="2" className="form-group">
                      <label htmlFor="feZipCode">{parentsParameters.ZIPCODE[languageCode]}</label>
                      <FormInput
                        required
                        id="feZipCode"
                        placeholder={parentsParameters.ZIPCODE[languageCode]}
                        value={this.state.userZipCode}
                        onChange={e => this.setState({ userZipCode : e.target.value })}
                        disabled
                      />
                    </Col>
                  </Row>
                  <Row form>
                    {/* Finance number */}
                    <Col md="6" className="form-group">
                      <label htmlFor="feNIF">{parentsParameters.NIF[languageCode]}</label>
                      <FormInput
                        required
                        id="feNIF"
                        placeholder={parentsParameters.NIF[languageCode]}
                        value={this.state.userNif}
                        onChange={e => this.setState({ userNif : e.target.value })}
                        disabled
                      />
                    </Col>
                    {/* Citizen Card */}
                    <Col md="6" className="form-group">
                      <label htmlFor="feCC">{parentsParameters.CC[languageCode]}</label>
                      <FormInput
                        id="feCC"
                        placeholder={parentsParameters.CC[languageCode]}
                        value={this.state.userCc}
                        onChange={e => this.setState({ userCc : e.target.value })}
                        disabled
                      />
                    </Col>
                  </Row>
                  { this.state.editing ? <div><Button theme="danger" onClick={this.cancelEditing}>{cancel[languageCode]}</Button> <Button theme="success" className="float-right" onClick={this.cancelEditing}>{saveChanges[languageCode]}</Button> </div>
                    : <Button theme="accent" onClick={this.editForm}>{updateProfile[languageCode]}</Button>
                  }
                </Form>
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>
      </Card>
    );
  }
}





export default UserInfo;

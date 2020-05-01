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
import {languageCode, parentsParameters} from "../../utils/general_utils";
import {saveChanges, cancel, updateProfile} from "../../utils/common_strings";


class UserInfo extends React.Component {
  constructor(props) {
    super(props);

    //const {phone, nif, email, name, cc, job, street, city} = this.props.user;
    this.state = {
      title: "A minha informação",
      editing : false,
      userName : this.props.user!=null ? (this.props.user.name != null ? this.props.user.name : "") : "",
      userEmail : this.props.user!=null ? (this.props.user.email != null ? this.props.user.email : "") : "",
      userPhone : this.props.user!=null ? (this.props.user.phone != null ? this.props.user.phone : "") : "",
      userJob : this.props.user!=null ? (this.props.user.job != null ? this.props.user.job : "") : "",
      userNif : this.props.user!=null ? (this.props.user.nif != null ? this.props.user.nif : "") : "",
      userCc : this.props.user!=null ? (this.props.user.cc != null ? this.props.user.cc : "") : "",
      userStreet : this.props.user!=null ? (this.props.user.street != null ? this.props.user.street : "") : "",
      userCity : this.props.user!=null ? (this.props.user.city != null ? this.props.user.city : "") : "",
      userZipCode : this.props.user!=null ? (this.props.user.zipcode != null ? this.props.user.zipcode : "") : "",
      editabledInputsIdsSuffixes : [
        "Name", "Email", "Phone", "Job", "Street", "City", "ZipCode"
      ],
      oldValues : {
        Name : "",
        Email : "",
        Phone : "",
        Job : "",
        Street : "",
        City : "",
        ZipCode : ""
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

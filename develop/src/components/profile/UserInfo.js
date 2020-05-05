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
  languageCode, newParametersEntities,
  notAvailableDesignation,
  parentsParameters, studentsParameters
} from "../../utils/general_utils";
import {saveChanges, cancel, updateProfile} from "../../utils/common_strings";
import {profileInfoFormTitle} from "../../utils/page_titles_strings";


class UserInfo extends React.Component {
  constructor(props) {
    super(props);

    let parent, newParamsTypesD = null;
    const noValueString = notAvailableDesignation[languageCode];
    const infoFormTitle = profileInfoFormTitle[languageCode];

    if(this.props.userD!=null){
      parent = this.props.userD;
      newParamsTypesD = this.props.newParamsTypesD;
    }

    //const {phone, nif, email, name, cc, job, street, city} = this.props.user;
    this.state = {
      title: infoFormTitle,
      parent : parent,
      editing : false,
      disabled: true,
      newParamsTypesD : newParamsTypesD,
      // feedbacks
      nameFeedback : null,
      emailFeedback : null,
      phoneFeedback : null,
      nifFeedback : null,
      streetFeedback : null,
      cityFeedback : null,
      zipcodeFeedback : null,
      oldParent: null,
    };

    this.handleChangeParam = this.handleChangeParam.bind(this);
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

  handleChangeParam(e) {
    let parent = this.state.parent;
    let paramName = e.target.name;
    //console.log("paramName to change: " + paramName);
    // update the param with the new value
    parent[paramName] = e.target.value;
    //console.log("parent with new values: " + JSON.stringify(parent));
    this.setState({ parent: parent });
  }

  savePreviousParentData() {
    const parent = {...this.state.parent};
    this.setState({ oldParent: parent });
    //console.log("parent saved: " + JSON.stringify(parent));
  };

  restorePreviousParentData() {
    const oldParent = {...this.state.oldParent};
    this.setState({ parent: oldParent });
    //console.log("parent restored: " + JSON.stringify(oldParent));
  };

  enableEditableInputs() {
    this.setState({ disabled: false });
  }

  disableEditableInputs() {
    this.setState({ disabled: true });
  }

  editForm(){
    this.savePreviousParentData();
    this.setState({editing : true});
    this.enableEditableInputs();
  }

  cancelEditing() {
    this.restorePreviousParentData();
    this.setState({ editing: false });
    this.disableEditableInputs();
  }

  renderExtra() {
    let extraInputs = [];

    const parentParamsTypes = this.state.newParamsTypesD[newParametersEntities.parent[languageCode]];

    if(parentParamsTypes!=null){ // is null when there are no parent parameters
      for (let param in parentParamsTypes) {
        if (this.state.parent[param] == null /*in case of a child param*/)
          continue;

        const idx = "parent" + param;
        const type = parentParamsTypes[param].type;
        const step = parentParamsTypes[param].step;

        const newInput = (
          <FormGroup>
            <label htmlFor={idx}>{param}</label>
            <FormInput
              id={idx}
              type={type}
              step={step}
              name={param}
              placeholder=""
              value={this.state.parent[param]}
              onChange={this.handleChangeParam}
              required
              disabled={this.state.disabled ? "disabled" : ""}
            />
          </FormGroup>
        );
        extraInputs.push(newInput);
      }
    }


    return extraInputs;
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
                      <label htmlFor="parentName">{parentsParameters.NAME[languageCode]}</label>
                      <FormInput
                        required
                        id="feName"
                        name={parentsParameters.NAME[languageCode]}
                        placeholder={parentsParameters.NAME[languageCode]}
                        value={
                          this.state.parent[
                            parentsParameters.NAME[languageCode]
                            ]
                        }
                        onChange={this.handleChangeParam}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                    {/* Email */}
                    <Col md="6" className="form-group">
                      <label htmlFor="parentEmail">{parentsParameters.EMAIL[languageCode]}</label>
                      <FormInput
                        required
                        type="email"
                        id="parentEmail"
                        name={parentsParameters.EMAIL[languageCode]}
                        placeholder={parentsParameters.EMAIL[languageCode]}
                        value={
                          this.state.parent[parentsParameters.EMAIL[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                  </Row>
                  <Row form>
                    {/* Phone */}
                    <Col md="6" className="form-group">
                      <label htmlFor="parentPhone">{parentsParameters.PHONE[languageCode]}</label>
                      <FormInput
                        required
                        type="tel"
                        id="parentPhone"
                        name={parentsParameters.PHONE[languageCode]}
                        placeholder={parentsParameters.PHONE[languageCode]}
                        value={
                          this.state.parent[parentsParameters.PHONE[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                    {/* Job */}
                    <Col md="6" className="form-group">
                      <label htmlFor="parentJob">{parentsParameters.JOB[languageCode]}</label>
                      <FormInput
                        id="parentJob"
                        name={parentsParameters.JOB[languageCode]}
                        placeholder={parentsParameters.JOB[languageCode]}
                        value={
                          this.state.parent[parentsParameters.JOB[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                  </Row>
                  <Row form>
                    {/* Address | Street */}
                    <Col md="6" className="form-group">
                      <label htmlFor="parentStreet">{parentsParameters.STREET[languageCode]}</label>
                      <FormInput
                        required
                        id="parentStreet"
                        name={parentsParameters.STREET[languageCode]}
                        placeholder={parentsParameters.STREET[languageCode]}
                        value={
                          this.state.parent[parentsParameters.STREET[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                    {/* City */}
                    <Col md="4" className="form-group">
                      <label htmlFor="parentCity">{parentsParameters.CITY[languageCode]}</label>
                      <FormInput
                        required
                        id="parentCity"
                        name={parentsParameters.CITY[languageCode]}
                        placeholder={parentsParameters.CITY[languageCode]}
                        value={
                          this.state.parent[parentsParameters.CITY[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                    {/* Zip Code */}
                    <Col md="2" className="form-group">
                      <label htmlFor="parentZipCode">{parentsParameters.ZIPCODE[languageCode]}</label>
                      <FormInput
                        required
                        id="parentZipCode"
                        name={parentsParameters.ZIPCODE[languageCode]}
                        placeholder={parentsParameters.ZIPCODE[languageCode]}
                        value={
                          this.state.parent[parentsParameters.ZIPCODE[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                  </Row>
                  <Row form>
                    {/* Finance number */}
                    <Col md="6" className="form-group">
                      <label htmlFor="parentNIF">{parentsParameters.NIF[languageCode]}</label>
                      <FormInput
                        required
                        id="parentNIF"
                        name={parentsParameters.NIF[languageCode]}
                        placeholder={parentsParameters.NIF[languageCode]}
                        value={
                          this.state.parent[parentsParameters.NIF[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                    {/* Citizen Card */}
                    <Col md="6" className="form-group">
                      <label htmlFor="parentCC">{parentsParameters.CC[languageCode]}</label>
                      <FormInput
                        id="parentCC"
                        name={parentsParameters.CC[languageCode]}
                        placeholder={parentsParameters.CC[languageCode]}
                        value={
                          this.state.parent[parentsParameters.CC[languageCode]]
                        }
                        onChange={this.handleChangeParam}
                        disabled={this.state.disabled ? "disabled" : ""}
                      />
                    </Col>
                  </Row>
                  <hr />
                  {this.renderExtra()}

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

import React, {Component as SidebarMainNavbar} from "react";
import {
  Button,
  Card,
  CardHeader,
  Col, Container,
  Form, FormFeedback, FormGroup,
  FormInput, FormTextarea,
  ListGroup,
  ListGroupItem,
  Row, Tooltip
} from "shards-react";
import {
  assocParameters,
  languageCode, parentsParameters, showToast, toastTypes
} from "../../utils/general_utils";
import {
  saveChanges,
  cancel,
  updateProfile,
  updateAssocData
} from "../../utils/common_strings";
import {
  assocDataInfoFormTitle
} from "../../utils/page_titles_strings";
import {
  assocDataUpdateError,
  assocDataUpdateSuccess,
  assocLogoFormatsTipMessage,
  daysToDeleteRegistTipMessage,
  invalidZipMessage,
  loadingInfo,
  provideRequiredFieldsMessage
} from "../../utils/messages_strings";
import {validZip} from "../../firebase_scripts/installation";
import {
  getAssocDoc,
  updateAssocDoc
} from "../../firebase_scripts/get_assoc_info";
import AssocLogoModal from "./AssocLogoModal";
import {firebase_auth} from "../../firebase-config";
import {Redirect} from "react-router-dom";


class AssocDataInfo extends React.Component {
  constructor(props) {
    super(props);

    let assoc = null;
    const infoFormTitle = assocDataInfoFormTitle[languageCode];

    /*if(this.props.assoc!=null){
      assoc = this.props.assoc;
    }*/


    this.state = {
      title: infoFormTitle,
      assocDoc : assoc,
      editing : false,
      disabled: true,
      // feedbacks
      feedbacks : {
        [assocParameters.ZIP[languageCode]] : false,
        [assocParameters.DAYS_TO_DELETE_REGISTRATION[languageCode]] : false,
        //[assocParameters.DESCRIPTION[languageCode]] : false,
        [assocParameters.EMAIL[languageCode]] : false,
        //[assocParameters.IBAN[languageCode]] : false,
        //[assocParameters.CITY[languageCode]] : false,
        //[assocParameters.LOGO[languageCode]] : false,
        //[assocParameters.STREET[languageCode]] : false,
        [assocParameters.NAME[languageCode]] : false,
        [assocParameters.FEE[languageCode]] : false,
        //[assocParameters.PHONE[languageCode]] : false,
      },
      oldAssocData: null,
      onUpdateButtonsDisabled : false,
      daysForRegistrationsTooltip : false
    };

    this.toggle = this.toggle.bind(this);

    this.handleChangeParam = this.handleChangeParam.bind(this);
    this.enableEditableInputs = this.enableEditableInputs.bind(this);
    this.disableEditableInputs = this.disableEditableInputs.bind(this);
    this.disableUpdateButtons = this.disableUpdateButtons.bind(this);
    this.enableUpdateButtons = this.enableUpdateButtons.bind(this);
    this.editForm = this.editForm.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.lockFormAfterSubmit = this.lockFormAfterSubmit.bind(this);

    this.updateAssoc = this.updateAssoc.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

  }



  /*********************************** LIFECYCLE ***********************************/
  componentDidMount(updating) {
    //this._isMounted = true;
    if(updating){
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
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/
  toggle(pos) {
    const newState = {};
    newState[pos] = !this.state[pos];
    this.setState({ ...this.state, ...newState });
  }

  updateAssoc(){
    const this_ = this;
    const validResult = this_.validForm();
    if(!validResult){
      showToast(provideRequiredFieldsMessage[languageCode], 5000, toastTypes.ERROR);
    }
    else{
      this_.disableEditableInputs();
      this_.disableUpdateButtons();
      //this.cancelEditing();
      //showToast(changesCommitSuccess[languageCode], 5000, toastTypes.SUCCESS);
      updateAssocDoc(this.state.assocDoc)
        .then(() => {
          getAssocDoc()
            .then(doc => {
              if (!doc.exists) {
                console.log('No assotiation document found!');
              }
              else {
                const assocData = doc.data();
                // update assoc data in localstorage
                window.localStorage.setItem("assocDoc", JSON.stringify(assocData));
                console.log("assocData recebida depois do update info -> " + JSON.stringify(assocData));
                this_.lockFormAfterSubmit();
                // TODO: update navbar instantaneously with logo
                showToast(assocDataUpdateSuccess[languageCode], 5000, toastTypes.SUCCESS);
              }
            })
            .catch(err => {
              console.log('Error getting document', err);
            });
        })
        .catch((error) => {
          if(Object.keys(error).length!==0){
            console.log("update error: " + JSON.stringify(error));
            showToast(assocDataUpdateError[languageCode], 5000, toastTypes.ERROR);
            this_.cancelEditing();
            this_.enableUpdateButtons();
          }
        });
    }
  }

  lockFormAfterSubmit(){
    //this.resetFeedbacks();
    this.disableEditableInputs();
    this.enableUpdateButtons();
    this.setState({ editing: false });
    // save new assoc data
    const assocDoc = {...this.state.assocDoc};
    this.setState({ oldAssocData: assocDoc });
  }

  disableUpdateButtons(){
    this.setState({ onUpdateButtonsDisabled: true });
  }

  enableUpdateButtons(){
    this.setState({ onUpdateButtonsDisabled: false });
  }

  validForm(){
    // remove all feedbacks at the beginning
    this.resetFeedbacks();

    // check if all inputs are filled
    let changedFeedbacks = {...this.state.feedbacks};
    let allValid = true;

    for(let field in this.state.feedbacks){
      console.log("field -> " + field);
      if(field===assocParameters.ZIP[languageCode]){
        console.log("skipping zip");
        continue; // zip will be checked after this loop
      }
      const value = this.state.assocDoc[field];
      console.log("value -> " + value);
      if(value==null || value.toString().trim()===""){
        changedFeedbacks[field] = true;
        allValid = false;
      }
    }

    const zip = this.state.assocDoc[assocParameters.ZIP[languageCode]];
    console.log("zip to validate -> " + zip);
    // if zip if provided, validate it
    if(zip != null && zip.trim()!==""){
      console.log("zip length: " + zip.length);
      console.log("zip trim length: " + zip.trim().length);
      if(!validZip(zip)){
        changedFeedbacks[assocParameters.ZIP[languageCode]] = true;
        allValid = false;
        showToast(invalidZipMessage[languageCode], 5000, toastTypes.ERROR);
      }
    }


    this.state.feedbacks = changedFeedbacks;
    this.forceUpdate();
    return allValid;
  }

  resetFeedbacks(){
    let changedFeedbacks = {...this.state.feedbacks};
    for(let field in changedFeedbacks){
      changedFeedbacks[field] = false;
    }
    this.state.feedbacks = changedFeedbacks;
    this.forceUpdate();
  }

  handleChangeParam(e) {
    let assocDoc = this.state.assocDoc;
    let paramName = e.target.name;
    console.log("paramName to change: " + paramName);
    // update the param with the new value
    assocDoc[paramName] = e.target.value;
    //console.log("assocDoc with new values: " + JSON.stringify(assocDoc));
    this.setState({ assocDoc: assocDoc });
  }

  savePreviousAssocData() {
    const assocDoc = {...this.state.assocDoc};
    this.setState({ oldAssocData: assocDoc });
    //console.log("assocDoc saved: " + JSON.stringify(assocDoc));
  };

  restorePreviousAssocData() {
    const oldAssocData = {...this.state.oldAssocData};
    this.setState({ assocDoc: oldAssocData });
    console.log("assocDoc restored: " + JSON.stringify(oldAssocData));
  };

  enableEditableInputs() {
    this.setState({ disabled: false });
  }

  disableEditableInputs() {
    this.setState({ disabled: true });
  }

  editForm(){
    this.savePreviousAssocData();
    this.setState({editing : true});
    this.enableEditableInputs();
  }

  cancelEditing() {
    this.restorePreviousAssocData();
    this.setState({ editing: false });
    this.disableEditableInputs();
  }


  render() {
    if (this.state.assocDoc == null) {
      return (
        <Container fluid className="main-content-container px-4">
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
                    {/* COLUNA DA ESQUERDA */}
                    <Col md="5" className="form-group" style={{paddingRight:"10px"}}>
                      <Row>
                        <Col md="12" className="form-group">
                          <label htmlFor="assocLogo">{assocParameters.LOGO[languageCode]}</label>
                        </Col>
                      </Row>
                      <Row form >
                        <Col lg="12" md="12">
                          <div id="assocLogo"
                            style={{
                              width: "100%",
                              height: "120px",
                              backgroundImage: "url(" + this.state.assocDoc[assocParameters.LOGO[languageCode]] + ")",
                              backgroundPosition : "center",
                              borderRadius: "2%",
                              backgroundSize: "contain",
                              backgroundRepeat: "no-repeat",
                            }}>
                          </div>
                        </Col>
                        <Col lg="12" md="12">
                          <div className="d-flex p-2 justify-content-center">
                            <AssocLogoModal photo={this.state.assocDoc[assocParameters.LOGO[languageCode]]} componentDidMount={this.componentDidMount}/>
                          </div>
                        </Col>
                      </Row>
                      <Row form>
                        <Col md="12" className="form-group">
                          <label htmlFor="assocName">{assocParameters.NAME[languageCode]}</label>
                          <FormInput
                            required
                            id="assocName"
                            name={assocParameters.NAME[languageCode]}
                            placeholder={assocParameters.NAME[languageCode]}
                            value={this.state.assocDoc[assocParameters.NAME[languageCode]]}
                            onChange={this.handleChangeParam}
                            invalid={this.state.feedbacks[assocParameters.NAME[languageCode]]}
                            disabled={this.state.disabled ? "disabled" : ""}
                          />
                        </Col>
                      </Row>
                      <Row form>
                        <Col md="12" className="form-group">
                          {/* Descricao Textarea */}
                          <label htmlFor="assocDesc">{assocParameters.DESCRIPTION[languageCode]}</label>
                          <FormTextarea
                            //required
                            id="assocDesc"
                            name={assocParameters.DESCRIPTION[languageCode]}
                            placeholder={assocParameters.DESCRIPTION[languageCode]}
                            value={
                              this.state.assocDoc[assocParameters.DESCRIPTION[languageCode]]
                            }
                            onChange={this.handleChangeParam}
                            //invalid={this.state.feedbacks[assocParameters.DESCRIPTION[languageCode]]}
                            disabled={this.state.disabled ? "disabled" : ""}
                          />
                        </Col>
                      </Row>
                    </Col>

                    {/* COLUNA DA DIREITA */}
                    <Col md="7" className="form-group">
                      <Row form>
                        {/* Address | Street */}
                        <Col md="12" className="form-group">
                          <label htmlFor="assocStreet">{assocParameters.STREET[languageCode]}</label>
                          <FormInput
                            //required
                            id="assocStreet"
                            name={assocParameters.STREET[languageCode]}
                            placeholder={assocParameters.STREET[languageCode]}
                            value={
                              this.state.assocDoc[assocParameters.STREET[languageCode]]
                            }
                            onChange={this.handleChangeParam}
                            //invalid={this.state.feedbacks[assocParameters.STREET[languageCode]]}
                            disabled={this.state.disabled ? "disabled" : ""}
                          />
                        </Col>
                      </Row>
                      <Row form>
                        {/* City */}
                        <Col md="8" className="form-group">
                          <label htmlFor="assocCity">{assocParameters.CITY[languageCode]}</label>
                          <FormInput
                            //required
                            id="assocCity"
                            name={assocParameters.CITY[languageCode]}
                            placeholder={assocParameters.CITY[languageCode]}
                            value={
                              this.state.assocDoc[assocParameters.CITY[languageCode]]
                            }
                            onChange={this.handleChangeParam}
                            //invalid={this.state.feedbacks[assocParameters.CITY[languageCode]]}
                            disabled={this.state.disabled ? "disabled" : ""}
                          />
                        </Col>
                        {/* Zip Code */}
                        <Col md="4" className="form-group">
                          <label htmlFor="assocZipCode">{assocParameters.ZIP[languageCode]}</label>
                          <FormInput
                            //required
                            id="assocZipCode"
                            name={assocParameters.ZIP[languageCode]}
                            placeholder={assocParameters.ZIP[languageCode]}
                            value={
                              this.state.assocDoc[assocParameters.ZIP[languageCode]]
                            }
                            onChange={this.handleChangeParam}
                            invalid={this.state.feedbacks[assocParameters.ZIP[languageCode]]}
                            disabled={this.state.disabled ? "disabled" : ""}
                          />
                        </Col>
                      </Row>
                      <Row form>
                        <Col md="6" className="form-group">
                          <label htmlFor="assocEmail">{assocParameters.EMAIL[languageCode]}</label>
                          <FormInput
                            required
                            type="email"
                            id="assocEmail"
                            name={assocParameters.EMAIL[languageCode]}
                            placeholder={assocParameters.EMAIL[languageCode]}
                            value={
                              this.state.assocDoc[assocParameters.EMAIL[languageCode]]
                            }
                            onChange={this.handleChangeParam}
                            invalid={this.state.feedbacks[assocParameters.EMAIL[languageCode]]}
                            disabled={this.state.disabled ? "disabled" : ""}
                          />
                        </Col>
                        {/* Phone */}
                        <Col md="6" className="form-group">
                          <label htmlFor="assocPhone">Contacto telefónico</label>
                          <FormInput
                            //required
                            type="tel"
                            id="assocPhone"
                            name={assocParameters.PHONE[languageCode]}
                            placeholder={assocParameters.PHONE[languageCode]}
                            value={
                              this.state.assocDoc[assocParameters.PHONE[languageCode]]
                            }
                            onChange={this.handleChangeParam}
                            //invalid={this.state.feedbacks[assocParameters.PHONE[languageCode]]}
                            disabled={this.state.disabled ? "disabled" : ""}
                          />
                        </Col>
                      </Row>
                      <Row form>
                        <Col md="12" className="form-group">
                          <label htmlFor="assocIBAN">{assocParameters.IBAN[languageCode]}</label>
                          <FormInput
                            //required
                            id="assocIBAN"
                            name={assocParameters.IBAN[languageCode]}
                            placeholder={assocParameters.IBAN[languageCode]}
                            value={
                              this.state.assocDoc[assocParameters.IBAN[languageCode]]
                            }
                            onChange={this.handleChangeParam}
                            //invalid={this.state.feedbacks[assocParameters.IBAN[languageCode]]}
                            disabled={this.state.disabled ? "disabled" : ""}
                          />
                        </Col>
                      </Row>
                      <Row form>
                        <Col md="5" className="form-group">
                          <label htmlFor="assocFee">Valor da Quota (€)</label>
                          <FormInput
                            required
                            type="number"
                            id="assocFee"
                            name={assocParameters.FEE[languageCode]}
                            placeholder={assocParameters.FEE[languageCode]}
                            value={
                              this.state.assocDoc[assocParameters.FEE[languageCode]]
                            }
                            onChange={this.handleChangeParam}
                            invalid={this.state.feedbacks[assocParameters.FEE[languageCode]]}
                            disabled={this.state.disabled ? "disabled" : ""}
                          />
                        </Col>
                        <Col md="7" className="form-group">
                          <label htmlFor="assocDeleteDays">Dias de persistência dos pedidos de registo <span id="assocDeleteDaysTooltip" className="material-icons" style={{fontSize:"100%"}}>info</span></label>
                          <Tooltip
                            open={this.state.daysForRegistrationsTooltip}
                            target="#assocDeleteDaysTooltip"
                            toggle={() => this.toggle("daysForRegistrationsTooltip")}
                            style={{fontSize:"120%"}}
                          >
                            {daysToDeleteRegistTipMessage[languageCode]}
                          </Tooltip>
                          <FormInput
                            required
                            type="number"
                            id="assocDeleteDays"
                            name={assocParameters.DAYS_TO_DELETE_REGISTRATION[languageCode]}
                            placeholder={assocParameters.DAYS_TO_DELETE_REGISTRATION[languageCode]}
                            value={
                              this.state.assocDoc[assocParameters.DAYS_TO_DELETE_REGISTRATION[languageCode]]
                            }
                            onChange={this.handleChangeParam}
                            invalid={this.state.feedbacks[assocParameters.DAYS_TO_DELETE_REGISTRATION[languageCode]]}
                            disabled={this.state.disabled ? "disabled" : ""}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <hr />

                  { this.state.editing ? <div><Button theme="danger" onClick={this.cancelEditing} disabled={this.state.onUpdateButtonsDisabled}>{cancel[languageCode]}</Button> <Button theme="success" className="float-right" onClick={this.updateAssoc} disabled={this.state.onUpdateButtonsDisabled}>{saveChanges[languageCode]}</Button> </div>
                    : <Button theme="accent" onClick={this.editForm}>{updateAssocData[languageCode]}</Button>
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





export default AssocDataInfo;

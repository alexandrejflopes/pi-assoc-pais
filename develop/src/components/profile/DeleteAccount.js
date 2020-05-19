import React from "react";
import {
  Button,
  Card,
  CardHeader,
  Col,
  Form,
  ListGroup,
  ListGroupItem,
  Row
} from "shards-react";
import {
  languageCode, parentsParameters, showToast, toastTypes
} from "../../utils/general_utils";
import {
  deleteAccountSectionTitle
} from "../../utils/page_titles_strings";
import {
  confirmDeleteAccount,
  confirmLogoutAfterDelete,
  deleteAccountExplanation,
  deleteAccountGenericErrorMsg,
  deleteAccountSuccess
} from "../../utils/messages_strings";
import {
  deleteAccountPrompt,
  erase
} from "../../utils/common_strings";
import {
  deleteAccount,
  userLogOut
} from "../../firebase_scripts/profile_functions";
import ConfirmationDialog from "../dialog/ConfirmationDialog";
import AknowledgementDialog from "../dialog/AknowledgementDialog";


class DeleteAccount extends React.Component {
  constructor(props) {
    super(props);

    let parent = null;
    const infoFormTitle = deleteAccountSectionTitle[languageCode];

    if(this.props.user!=null){
      parent = this.props.user;
    }

    this.state = {
      title: infoFormTitle,
      parent : parent,
      dialogOpen : false,
      deleteAccountDialogOpen : false,
    };

    this.deleteUserAccount = this.deleteUserAccount.bind(this);
    this.finnishDeleteAccountFlow = this.finnishDeleteAccountFlow.bind(this);

    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.closeSuccessDialog = this.closeSuccessDialog.bind(this);
    this.openSuccessDialog = this.openSuccessDialog.bind(this);

  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/

  deleteUserAccount(confirmation){
    console.log("result dialog: " + confirmation);
    this.closeDialog();
    const this_ = this;

    const email = this_.state.parent[parentsParameters.EMAIL[languageCode]];
    console.log("email da conta a eliminar -> " + email);

    if(confirmation){
      deleteAccount(email)
        .then((result) => {
          if(result.error==null){
            const upParentString = JSON.stringify(result);
            console.log("deletedParent recebido depois do delete email -> " + upParentString);
            this_.openSuccessDialog();
          }
          else{
            console.log("result error: " + JSON.stringify(result));
            showToast(deleteAccountGenericErrorMsg[languageCode], 5000, toastTypes.ERROR);
          }
        })
        .catch((error) => {
          if(Object.keys(error).length!==0){
            console.log("update error: " + JSON.stringify(error));
            showToast(deleteAccountGenericErrorMsg[languageCode], 5000, toastTypes.ERROR);
          }
        });

    }
    else{
      this_.closeDialog();
    }
  }


  finnishDeleteAccountFlow(){
    userLogOut();
  }

  closeDialog() {
    this.setState({dialogOpen : false});
  }

  openDialog() {
    this.setState({dialogOpen : true});
  }

  closeSuccessDialog() {
    //alert("close success");
    this.setState({deleteAccountDialogOpen : false});
  }

  openSuccessDialog() {
    //alert("abrir success");
    this.setState({deleteAccountDialogOpen : true});
  }


  render() {
    return (
      <Card small className="mb-4" >
        <CardHeader className="border-bottom bg-danger">
          <h6 className="m-0 text-white">{this.state.title}</h6>
        </CardHeader>
        <ListGroup flush>
          <ListGroupItem className="p-3">
            <Row>
              <Col>
                <Form>
                  <Row>
                    <Col md="12">
                      <p>
                        {deleteAccountExplanation[languageCode]}
                      </p>
                    </Col>
                  </Row>
                  <hr />
                  <Button theme="danger" onClick={this.openDialog}><span className="material-icons md-24" style={{fontSize:"150%", textAlign: "center", verticalAlign:"middle"}}>delete</span> {erase[languageCode]}</Button>
                </Form>
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>

        {this.state.dialogOpen ?
          <ConfirmationDialog
            open={this.state.dialogOpen}
            result={this.deleteUserAccount}
            title={deleteAccountPrompt[languageCode]}
            message={confirmDeleteAccount[languageCode]}/>
          : null}

        {this.state.deleteAccountDialogOpen ?
          <AknowledgementDialog
            open={this.state.deleteAccountDialogOpen}
            after={this.finnishDeleteAccountFlow}
            title={deleteAccountSuccess[languageCode]}
            message={confirmLogoutAfterDelete[languageCode]}
            parent={this}/>
          : null}

      </Card>

    );
  }
}





export default DeleteAccount;

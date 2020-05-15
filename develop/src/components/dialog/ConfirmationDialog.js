import React from "react";
import {Button} from "shards-react";

import { languageCode } from "../../utils/general_utils";
import DialogTitle from "@material-ui/core/DialogTitle";
import {no, yes} from "../../utils/common_strings";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";

class ConfirmationDialog extends React.Component {
  constructor(props) {
    super(props);

    const open = this.props.open;

    this.state = {
      open : open,
    };


    this.componentDidMount = this.componentDidMount.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.confirm = this.confirm.bind(this);
    this.reject = this.reject.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/

  closeDialog() {
    this.setState({open : false});
  }

  openDialog() {
    this.setState({open : true});
  }

  confirm() {
    this.props.result(true);
  }

  reject() {
    this.props.result(false);
  }



  render() {

    return(
      <Dialog
        open={this.state.open}
        onClose={this.closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {this.props.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.reject} theme="danger">
            {no[languageCode]}
          </Button>
          <Button onClick={this.confirm} theme="primary" autoFocus>
            {yes[languageCode]}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default ConfirmationDialog;

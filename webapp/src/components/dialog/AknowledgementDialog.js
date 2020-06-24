import React from "react";
import {Button} from "shards-react";

import { languageCode } from "../../utils/general_utils";
import DialogTitle from "@material-ui/core/DialogTitle";
import {no, ok, yes} from "../../utils/common_strings";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";

class AknowledgementDialog extends React.Component {
  constructor(props) {
    super(props);

    const open = this.props.open;


    this.state = {
      open : open,
    };


    this.componentDidMount = this.componentDidMount.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.handleOk = this.handleOk.bind(this);
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

  handleOk(){
    if(this.props.parent){
      this.props.after(this.props.parent);
    }
    else{
      this.props.after();
    }
  }



  render() {

    return(
      <Dialog
        open={this.state.open}
        onClose={this.closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {this.props.title ? <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle> : null}

        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {this.props.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleOk} theme="primary" autoFocus>
            {ok[languageCode]}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default AknowledgementDialog;

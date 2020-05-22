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
  exportMyData, exportWord,
} from "../../utils/page_titles_strings";
import {FormText} from "react-bootstrap";
import {
  exportUserDataOnProcess,
  exportProfileExplanation, exportUserDataSucess, exportUserDataError
} from "../../utils/messages_strings";
import {
  exportParentToCSV,
  exportParentToPDF
} from "../../firebase_scripts/profile_functions";



class ExportProfile extends React.Component {
  constructor(props) {
    super(props);

    let parent = null;
    const infoFormTitle = exportMyData[languageCode];

    if(this.props.user!=null){
      parent = this.props.user;
    }

    this.state = {
      title: infoFormTitle,
      parent : parent,
      dialogOpen : false,
    };

    this.exportParentData = this.exportParentData.bind(this);

  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/


  exportParentData(){
    const email = this.state.parent[parentsParameters.EMAIL[languageCode]];
    const parentName = this.state.parent[parentsParameters.NAME[languageCode]];
    console.log("email to export: " + email);

    showToast(exportUserDataOnProcess[languageCode], 3000, toastTypes.INFO);

    exportParentToCSV(email)
      .then((file) => {
        if(file==null){
          showToast(exportUserDataError[languageCode], 8000, toastTypes.ERROR);
          return;
        }
        const url = window.URL.createObjectURL(new Blob([file]));
        // creat anchor tag with download attr
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', "User" + parentName + ".csv");
        link.setAttribute('display', "none");
        document.body.appendChild(link);
        // 4. Force download
        link.click();
        showToast(exportUserDataSucess[languageCode], 5000, toastTypes.SUCCESS);
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
              <Col>
                <Form>
                  <Row form>
                    <Col md="12" className="form-group">
                      <p>
                        {exportProfileExplanation[languageCode]}
                      </p>
                    </Col>
                  </Row>
                  <hr />
                  <Button theme="accent" onClick={this.exportParentData}><span className="material-icons md-24" style={{fontSize:"150%", textAlign: "center", verticalAlign:"middle"}}>get_app</span> {exportWord[languageCode]}</Button>
                </Form>
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>

      </Card>

    );
  }
}





export default ExportProfile;

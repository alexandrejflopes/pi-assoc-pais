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
  assocDataZipName,
  languageCode,
  membersChildrenDesignation,
  membersDesignation,
  parentsParameters, showToast, toastTypes
} from "../../utils/general_utils";
import {
  exportAssocData,
  exportMyData, exportWord,
} from "../../utils/page_titles_strings";
import {FormText} from "react-bootstrap";
import {
  exportAssocDataExplanation, exportAssocDataOnProcess, exportAssocDataSuccess,
  exportChildrenDataError,
  exportMembersDataError,
  exportProfileExplanation,
  exportUserDataError,
  exportUserDataOnProcess,
  exportUserDataSucess
} from "../../utils/messages_strings";
import {
  exportAllChildrenToCSV,
  exportAllParentsToCSV,
  exportParentToCSV
} from "../../firebase_scripts/profile_functions";
import JSZip from "jszip";
import { saveAs } from 'file-saver';

class ExportAssocData extends React.Component {
  constructor(props) {
    super(props);

    let parent = null;
    const infoFormTitle = exportAssocData[languageCode];

    if(this.props.user!=null){
      parent = this.props.user;
    }

    this.state = {
      title: infoFormTitle,
      parent : parent,
      dialogOpen : false,
    };


    this.exportAssocData = this.exportAssocData.bind(this);


  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/

  exportAssocData(){
    let zip = new JSZip();
    const zipFileName = assocDataZipName[languageCode];

    let filesUrlsArray = [];

    const parentsFileName = membersDesignation[languageCode] + ".csv";
    const childrenFileName = membersChildrenDesignation[languageCode] + ".csv";

    showToast(exportAssocDataOnProcess[languageCode], 3000, toastTypes.INFO);

    exportAllParentsToCSV()
      .then((parentsFile) => {
        if(parentsFile==null){
          showToast(exportMembersDataError[languageCode], 8000, toastTypes.ERROR);
          return;
        }
        const url = window.URL.createObjectURL(new Blob([parentsFile]));
        // save parents blob URL
        filesUrlsArray.push(url);

        zip.file(parentsFileName, parentsFile, {binary:true});

        exportAllChildrenToCSV()
          .then((childrenFile) => {
            if(childrenFile==null){
              showToast(exportChildrenDataError[languageCode], 8000, toastTypes.ERROR);
              return;
            }
            const url = window.URL.createObjectURL(new Blob([childrenFile]));
            // save children blob URL
            filesUrlsArray.push(url);

            zip.file(childrenFileName, childrenFile, {binary:true});

            zip.generateAsync({type:'blob'}).then(function(content) {
              saveAs(content, zipFileName);
              showToast(exportAssocDataSuccess[languageCode], 5000, toastTypes.SUCCESS);
            });

          });

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
                        {exportAssocDataExplanation[languageCode]}
                      </p>
                    </Col>
                  </Row>
                  <hr />
                  <Button theme="accent" onClick={this.exportAssocData}><span className="material-icons md-24" style={{fontSize:"150%", textAlign: "center", verticalAlign:"middle"}}>get_app</span> {exportWord[languageCode]}</Button>
                </Form>
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>

      </Card>

    );
  }
}



export default ExportAssocData;
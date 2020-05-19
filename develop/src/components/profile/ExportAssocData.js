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
  languageCode, parentsParameters
} from "../../utils/general_utils";
import {
  exportAssocData,
  exportMyData, exportWord,
} from "../../utils/page_titles_strings";
import {FormText} from "react-bootstrap";
import {
  exportAssocDataExplanation,
  exportProfileExplanation
} from "../../utils/messages_strings";
import {
  exportAllParentsToCSV,
  exportParentToCSV
} from "../../firebase_scripts/profile_functions";
import JSZip from "jszip";


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
    let zip = new JSZip();

    let filesUrlsArray = [];


    exportAllParentsToCSV()
      .then((file) => {
        const url = window.URL.createObjectURL(new Blob([file]));
        // save this blob URL
        filesUrlsArray.push(url);

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
                  <Button theme="accent" onClick={() => {}}><span className="material-icons md-24" style={{fontSize:"150%", textAlign: "center", verticalAlign:"middle"}}>get_app</span> {exportWord[languageCode]}</Button>
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

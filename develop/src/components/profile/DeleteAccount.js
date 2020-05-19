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
  languageCode
} from "../../utils/general_utils";
import {
  deleteAccount,
  exportMyData, exportWord,
} from "../../utils/page_titles_strings";
import {FormText} from "react-bootstrap";
import {
  deleteAccountExplanation,
  exportProfileExplanation
} from "../../utils/messages_strings";
import {erase} from "../../utils/common_strings";
import red from "@material-ui/core/colors/red";


class DeleteAccount extends React.Component {
  constructor(props) {
    super(props);

    let parent = null;
    const infoFormTitle = deleteAccount[languageCode];

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
                  <Button theme="danger" onClick={() => {}}><span className="material-icons md-24" style={{fontSize:"150%", textAlign: "center", verticalAlign:"middle"}}>clear</span> {erase[languageCode]}</Button>
                </Form>
              </Col>
            </Row>
          </ListGroupItem>
        </ListGroup>

      </Card>

    );
  }
}





export default DeleteAccount;

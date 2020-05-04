import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  Button,
  ListGroup,
  ListGroupItem,
  Progress, CardBody, Row, Col, CardFooter
} from "shards-react";

import ListGroupReact from "react-bootstrap/ListGroup";
import {
  defaultAvatar,
  languageCode,
  parentsParameters, studentsParameters
} from "../../utils/general_utils";
import {saveChanges} from "../../utils/common_strings";
import {profileMyChildren} from "../../utils/page_titles_strings";
import EducandosModal from "./EducandosModal";

class UserOverview extends React.Component {

  constructor(props) {
    super(props);

    //console.log("overview props: " + JSON.stringify(props));

    let name, photo, assocNumber, email, phone, role, children, newParamsTypes = null;

    if(this.props.user!=null){
      name = this.props.user[parentsParameters.NAME[languageCode]];
      photo = this.props.user[parentsParameters.PHOTO[languageCode]];
      assocNumber = this.props.user[parentsParameters.ASSOC_NUMBER[languageCode]];
      email = this.props.user[parentsParameters.EMAIL[languageCode]];
      phone = this.props.user[parentsParameters.PHONE[languageCode]];
      role = this.props.user[parentsParameters.ROLE[languageCode]];
      children = this.props.user[parentsParameters.CHILDREN[languageCode]];
      newParamsTypes = this.props.newParamsTypes;
    }

    this.state = {
      userName : name!=null ? name : "",
      userPhoto : photo!=null ? photo : "",
      userAssocNumber : assocNumber!=null ? assocNumber : "",
      userEmail : email!=null ? email : "",
      userPhone : phone!=null ? phone : "",
      userRole : role!=null ? role : "",
      userEducandos : children!=null ? children : [],
      newParamsTypes : newParamsTypes

      /*educandosTeste : [
        {
          id: 0,
          name: "João Gomes",
          photo: defaultAvatar,
          schoolYear: "6"
        },
        {
          id: 1,
          name: "Laura Gomes",
          photo: defaultAvatar,
          schoolYear: "8"
        }
      ]*/
    }
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
    const { educandosTeste, userEducandos } = this.state;

    //console.log("userEducandos: " + JSON.stringify(userEducandos));

    return (
      <Card small className="mb-4 pt-3">
        <CardHeader className="border-bottom text-center">
          <div className="mb-3 mx-auto">
            <img
              className="rounded-circle"
              src={this.state.userPhoto}
              alt={this.state.userName}
              width="110"
            />
          </div>
          <h4 className="mb-0">{this.state.userName}</h4>
          <span className="text-muted d-block mb-2">{this.state.userEmail}</span>
          <span className="text-muted d-block mb-2">{this.state.userAssocNumber} | {this.state.userRole}</span>
        </CardHeader>
        <ListGroup flush>
          <ListGroupItem className="px-4">
            <Row>
              <Col lg="10" md="10" sm="10">
                <h5 className="mb-0 float-left">{profileMyChildren[languageCode]}</h5>
              </Col>
              <Col lg="2" md="2" sm="2">
                <Button size="sm" className="float-right" onClick={() => {}}><span className="material-icons" style={{fontSize:"150%", textAlign: "center", verticalAlign:"middle"}}>person_add</span></Button>
              </Col>
            </Row>
          </ListGroupItem>
          <ListGroupItem>
            <Row>
              {userEducandos.length === 0 ? <Col/> :
                userEducandos.map((student,idx) => (
                  <EducandosModal educando={userEducandos[idx]} indice={idx} newParamsTypes={this.state.newParamsTypes}/>
                  /*<Col sm="12" lg="6" md="12">
                    <ListGroupReact flush style={{ textAlign: "center" }}>
                      <ListGroupReact.Item id={idx} className="p-3" action onClick={()=>{}} style={{border:"1px solid", borderColor: "#DFE2E4"}}>
                        <div className="mb-3 mx-auto">
                          <img
                            className="rounded-circle"
                            src={defaultAvatar}
                            alt={student[studentsParameters.NAME[languageCode]]}
                            width="50"
                          />
                        </div>
                        <h6 className="mb-0">{student[studentsParameters.NAME[languageCode]]}</h6>
                      </ListGroupReact.Item>
                    </ListGroupReact>
                  </Col>*/
                ))
              }
            </Row>
          </ListGroupItem>


        </ListGroup>


      </Card>
    );
  }
}



export default UserOverview;

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
import {defaultAvatar, languageCode} from "../../utils/general_utils";
import {saveChanges} from "../../utils/common_strings";

class UserOverview extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      userName : this.props.user!=null ? (this.props.user.name != null ? this.props.user.name : "") : "Diogo Gomes",
      userPhoto : this.props.user!=null ? (this.props.user.photo != null ? this.props.user.role.photo : "") : defaultAvatar,
      userAssocNumber : this.props.user!=null ? (this.props.user.assocNumber != null ? this.props.user.assocNumber : "") : "00000",
      userEmail : this.props.user!=null ? (this.props.user.email != null ? this.props.user.email : "") : "dgomes@assocpais.pt",
      userPhone : this.props.user!=null ? (this.props.user.phone != null ? this.props.user.phone : "") : "123456789",
      userRole : this.props.user!=null ? (this.props.user.role != null ? this.props.user.role : "") : "Presidente",
      userEducandos : this.props.user!=null ? (this.props.user.educandos != null ? this.props.user.educandos : []) : [],

      educandosTeste : [
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
      ],

      userDetails: {
        name: "Sierra Brooks",
        avatar: require("./../../images/avatars/0.jpg"),
        jobTitle: "Project Manager",
        performanceReportTitle: "Workload",
        performanceReportValue: 74,
        metaTitle: "Description",
        metaValue:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio eaque, quidem, commodi soluta qui quae minima obcaecati quod dolorum sint alias, possimus illum assumenda eligendi cumque?"
      }
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
    const { educandosTeste } = this.state;
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
                <h5 className="mb-0 float-left">Os meus educandos</h5>
              </Col>
              <Col lg="2" md="2" sm="2">
                <Button size="sm" className="float-right" onClick={() => {}}><span className="material-icons" style={{fontSize:"150%", textAlign: "center", verticalAlign:"middle"}}>person_add</span></Button>
              </Col>
            </Row>
          </ListGroupItem>
          <ListGroupItem>
            <Row>
              {educandosTeste.map((student,idx) => (
                <Col sm="12" lg="6" md="12">
                  <ListGroupReact flush style={{ textAlign: "center" }}>
                    <ListGroupReact.Item id={idx} className="p-3" action onClick={()=>{}} style={{border:"1px solid", borderColor: "#DFE2E4"}}>
                      <div className="mb-3 mx-auto">
                        <img
                          className="rounded-circle"
                          src={student.photo}
                          alt={student.name}
                          width="50"
                        />
                      </div>
                      <h6 className="mb-0">{student.name}</h6>
                    </ListGroupReact.Item>
                  </ListGroupReact>
                </Col>
              ))}
            </Row>
          </ListGroupItem>


        </ListGroup>


      </Card>
    );
  }
}



export default UserOverview;

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

import {
  defaultAvatar,
  languageCode,
  parentsParameters, studentsParameters
} from "../../utils/general_utils";
import {profileMyChildren} from "../../utils/page_titles_strings";
import EducandosModal from "./EducandosModal";
import NewEducandoModal from "./NewEducandoModal";
import ParentPhotoModal from "./ParentPhotoModal";

class UserOverview extends React.Component {

  constructor(props) {
    super(props);

    //console.log("overview props: " + JSON.stringify(props));

    let parent, newParamsTypes = null;

    if(this.props.user!=null){
      parent = this.props.user;
      newParamsTypes = this.props.newParamsTypes;
    }

    this.state = {
      parent : parent,
      newParamsTypes : newParamsTypes,
      editingPhoto : false
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.cancelEditingPhoto = this.cancelEditingPhoto.bind(this);
    this.editPhoto = this.editPhoto.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount(updating) {
    //this._isMounted = true;
    if(updating){
      const localUser = JSON.parse(window.localStorage.getItem("userDoc"));
      if(localUser!=null){
        this.setState({parent : localUser});
      }
    }

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/


  editPhoto() {
    this.setState({ editingPhoto: true });
    document.getElementById("add-photo-button").onclick(function(e){
      e.preventDefault();
      document.getElementById("file-upload-input").trigger('click');
    });
  }


  cancelEditingPhoto() {
    this.setState({ editingPhoto: false });
  }

  render() {
    const { parent } = this.state;
    const userEducandos = parent[parentsParameters.CHILDREN[languageCode]];

    //console.log("userEducandos: " + JSON.stringify(userEducandos));

    return (
      <Card small className="mb-4 pt-3">
        <CardHeader className="border-bottom text-center">
          <Row style={{
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}>
            <div style={{
              width : "110px",
              height: "110px",
              backgroundImage: "url(" + this.state.parent[parentsParameters.PHOTO[languageCode]] + ")",
              backgroundPosition : "center",
              borderRadius: "50%",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat"
            }}>
            </div>
            {/*
            <img
              className="rounded-circle"
              src={this.state.parent[parentsParameters.PHOTO[languageCode]]}
              alt={this.state.parent[parentsParameters.NAME[languageCode]]}
              width="110"
            />
            */}
          </Row>
          <div style={{ margin: "10px" }} />
          <ParentPhotoModal photo={this.state.parent[parentsParameters.PHOTO[languageCode]]} componentDidMount={this.componentDidMount}/>
          <h4 className="mb-0">{this.state.parent[parentsParameters.NAME[languageCode]]}</h4>
          <span className="text-muted d-block mb-2">{this.state.parent[parentsParameters.EMAIL[languageCode]]}</span>
          <span className="text-muted d-block mb-2">{this.state.parent[parentsParameters.ASSOC_NUMBER[languageCode]]} | {this.state.parent[parentsParameters.ROLE[languageCode]]}</span>
        </CardHeader>
        <ListGroup flush>
          <ListGroupItem className="px-4">
            <Row>
              <Col lg="10" md="10" sm="10">
                <h5 className="mb-0 float-left">{profileMyChildren[languageCode]}</h5>
              </Col>
              <Col lg="2" md="2" sm="2">
                <NewEducandoModal newParamsTypesN={this.state.newParamsTypes} componentDidMount={this.componentDidMount}/>
                {/*
                <Button size="sm" className="float-right" onClick={() => {}}><span className="material-icons" style={{fontSize:"150%", textAlign: "center", verticalAlign:"middle"}}>person_add</span></Button>
                */}
              </Col>
            </Row>
          </ListGroupItem>
          <ListGroupItem>
            <Row>
              {userEducandos.length === 0 ? <Col/> :
                userEducandos.map((student,idx) => (
                  <EducandosModal key={student[studentsParameters.NAME[languageCode]]} educando={userEducandos[idx]} indice={idx} newParamsTypes={this.state.newParamsTypes} componentDidMount={this.componentDidMount}/>
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

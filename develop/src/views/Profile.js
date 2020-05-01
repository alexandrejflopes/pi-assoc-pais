import React from "react";
import { Container, Row, Col } from "shards-react";

import PageTitle from "../components/common/PageTitle";
import UserOverview from "../components/profile/UserOverview";
import UserInfo from "../components/profile/UserInfo";

class Profile extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      editingProfile : false
    }

    //this.componentDidMount = this.componentDidMount.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  render(){
    return(
      <Container fluid className="main-content-container px-4">
        <Row noGutters className="page-header py-4">
          <PageTitle title="O meu perfil" md="12" className="ml-sm-auto mr-sm-auto" />
        </Row>
        <Row>
          <Col lg="4">
            <UserOverview />
          </Col>
          <Col lg="8">
            <UserInfo />
          </Col>
        </Row>
      </Container>
    );
  }

}

export default Profile;

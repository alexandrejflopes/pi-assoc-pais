import React from "react";
import {Container, Row, Col, CardHeader, Card} from "shards-react";

import ConfigForm from "../components/config-inicial/ConfigForm";
import {languageCode} from "../utils/general_utils";
import {Redirect} from "react-router-dom";
import {initDoc} from "../firebase-config";
import {configFormTitle} from "../utils/page_titles_strings";


class AssocConfiguration extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      installationExists: null,
    };

  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

    initDoc
      .get()
      .then((doc) => {
        if (doc.exists === false) {
          this.setState({installationExists : false});
        }
        else {
          this.setState({installationExists : true});
        }
      })
      .catch((err) => {
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*********************************** HANDLERS ***********************************/



  render() {
    if(this.state.installationExists==null){
      return (
        <Container
          fluid
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {" "}
          <h1></h1>
        </Container>
      );
    }
    else if(this.state.installationExists===false){
      return (
        <Container fluid className="main-content-container px-4 pb-4">
          <Row style={{display:"flex" , justifyContent:"center", marginTop:"20px", marginRight:"0px"}}>
            {/* Form */}
            <Col lg="12" md="12" sm="12">
              <Card small>
                <CardHeader className="border-bottom">
                  <h6 className="m-0">{configFormTitle[languageCode]}</h6>
                </CardHeader>
                <ConfigForm />
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
    else if(this.state.installationExists===true){
      return <Redirect to="/login" />;
    }
    else{
      return (
        <Container
          fluid
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {" "}
          <h1>A carregar...</h1>
        </Container>
      );
    }
  }
}

export default AssocConfiguration;

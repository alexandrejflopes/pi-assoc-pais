import React from "react";
import PropTypes from "prop-types";
import { Navbar, NavbarBrand } from "shards-react";

import { Dispatcher, Constants } from "../../../flux";

import {getAssocDoc} from "../../../firebase_scripts/get_assoc_info"

class SidebarMainNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      assocLogoUrl: "",
      assocName: ""
    };
    this.handleToggleSidebar = this.handleToggleSidebar.bind(this);
  }

  handleToggleSidebar() {
    Dispatcher.dispatch({
      actionType: Constants.TOGGLE_SIDEBAR
    });
  }

  componentDidMount() {
    const localAssocDoc = JSON.parse(window.localStorage.getItem("assocDoc"));

    if(localAssocDoc!=null){
      this.setState({
        assocLogoUrl: localAssocDoc["Logótipo"],
        assocName: localAssocDoc["Nome da Associação de Pais"]
      });
    }
    else{
      const promise = getAssocDoc();

      console.log("promise -> " + promise);

      promise.then(doc => {
        if (!doc.exists) {
          console.log('No assotiation document found!');
        }
        else {
          const data = doc.data();
          window.localStorage.setItem("assocDoc", JSON.stringify(data));
          this.setState({
            assocLogoUrl: data["Logótipo"],
            assocName: data["Nome da Associação de Pais"]
          });
        }
      })
        .catch(err => {
          console.log('Error getting document', err);
        });
    }

  }

  render() {
    const { hideLogoText } = this.props;
    return (
      <div className="main-navbar">
        <Navbar
          className="align-items-stretch bg-white flex-md-nowrap border-bottom p-0"
          type="light"
        >
          <NavbarBrand
            className="w-100 mr-0"
            href="#"
            style={{ lineHeight: "25px" }}
          >
            <div className="d-table m-auto">
              <img
                id="main-logo"
                className="d-inline-block align-top mr-1"
                style={{ maxWidth: "100px", maxHeight: "40px" }}
                src={this.state.assocLogoUrl}
                alt={this.state.assocName}
              />
              {hideLogoText && (
                <span className="d-none d-md-inline ml-1">
                  {this.state.assocName}
                </span>
              )}
            </div>
          </NavbarBrand>
          {/* eslint-disable-next-line */}
          <a
            className="toggle-sidebar d-sm-inline d-md-none d-lg-none"
            onClick={this.handleToggleSidebar}
          >
            <i className="material-icons">&#xE5C4;</i>
          </a>
        </Navbar>
      </div>
    );
  }
}

SidebarMainNavbar.propTypes = {
  /**
   * Whether to hide the logo text, or not.
   */
  hideLogoText: PropTypes.bool
};

SidebarMainNavbar.defaultProps = {
  hideLogoText: false
};

export default SidebarMainNavbar;

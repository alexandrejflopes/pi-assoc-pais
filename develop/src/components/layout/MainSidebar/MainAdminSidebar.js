import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Col } from "shards-react";

import SidebarMainNavbar from "./SidebarMainNavbar";
import SidebarSearch from "./SidebarSearch";
import SidebarAdminNavItems from "./SidebarAdminNavItems";

import { StoreAdmin } from "../../../flux";

class MainAdminSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      menuVisible: false,
      sidebarAdminNavItems: StoreAdmin.getSidebarItems(),
    };

    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    StoreAdmin.addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    StoreAdmin.removeChangeListener(this.onChange);
  }

  onChange() {
    this.setState({
      ...this.state,
      menuVisible: StoreAdmin.getMenuState(),
      sidebarAdminNavItems: StoreAdmin.getSidebarItems(),
    });
  }

  render() {
    const classes = classNames(
      "main-sidebar",
      "px-0",
      "col-12",
      this.state.menuVisible && "open"
    );

    return (
      <Col tag="aside" className={classes} lg={{ size: 2 }} md={{ size: 3 }}>
        <SidebarMainNavbar hideLogoText={this.props.hideLogoText} />
        <SidebarSearch />
        <SidebarAdminNavItems />
      </Col>
    );
  }
}

MainAdminSidebar.propTypes = {
  /**
   * Whether to hide the logo text, or not.
   */
  hideLogoText: PropTypes.bool,
};

MainAdminSidebar.defaultProps = {
  hideLogoText: false,
};

export default MainAdminSidebar;

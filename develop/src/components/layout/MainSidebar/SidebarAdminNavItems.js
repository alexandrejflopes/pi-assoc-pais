import React from "react";
import { Nav } from "shards-react";

import SidebarAdminNavItem from "./SidebarAdminNavItem";
import { StoreAdmin } from "../../../flux";

class SidebarAdminNavItems extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      navItems: StoreAdmin.getSidebarItems(),
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
      navItems: StoreAdmin.getSidebarItems(),
    });
  }

  render() {
    const { navItems: items } = this.state;
    return (
      <div className="nav-wrapper">
        <Nav className="nav--no-borders flex-column">
          {items.map((item, idx) => (
            <SidebarAdminNavItem key={idx} item={item} />
          ))}
        </Nav>
      </div>
    );
  }
}

export default SidebarAdminNavItems;

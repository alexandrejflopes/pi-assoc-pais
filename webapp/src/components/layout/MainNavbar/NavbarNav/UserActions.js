import React from "react";
import { Link } from "react-router-dom";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Collapse,
  NavItem,
  NavLink,
  Row,
} from "shards-react";
import {
  defaultAvatar,
  languageCode,
  parentsParameters,
} from "../../../../utils/general_utils";
import {
  profileLogout,
  profilePageTitle,
  profileSettings, profileSettingsAdminSectionTitle,
} from "../../../../utils/page_titles_strings";
import {
  fetchUserDoc,
  userLogOut,
} from "../../../../firebase_scripts/profile_functions";
import { firebase_auth } from "../../../../firebase-config";


export default class UserActions extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      userName: "ND",
      userPhoto: defaultAvatar,
      isAdmin : false
    };

    this.toggleUserActions = this.toggleUserActions.bind(this);
    this.updateNavBarUserPhotoAndName = this.updateNavBarUserPhotoAndName.bind(this);
    //this.updateNavBarUserPhotoAndNameV2 = this.updateNavBarUserPhotoAndNameV2.bind(this);
    this.updateNavBar = this.updateNavBar.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

    this.updateNavBarUserPhotoAndName();
    // to poll localstorage or DB for changes in user info
    setInterval(this.updateNavBar,50000);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  toggleUserActions() {
    this.setState({
      visible: !this.state.visible,
    });
  }

  updateNavBar(){
    // check the local storage to see if it's still the same user
    let localUser = JSON.parse(window.localStorage.getItem("userDoc"));

    // if no information about the user in the LS, then do nothing
    if(localUser==null){
      return;
    }
    const displayName = localUser[parentsParameters.NAME[languageCode]];
    const photoURL = localUser[parentsParameters.PHOTO[languageCode]];
    const isAdmin = localUser[parentsParameters.ADMIN[languageCode]];
    this.setState({ userName: displayName, userPhoto: photoURL, isAdmin : isAdmin });
  }

  updateNavBarUserPhotoAndName() {
    // check the local storage to see if it's still the same user
    let localUser = JSON.parse(window.localStorage.getItem("userDoc"));
    let firebaseUser = firebase_auth.currentUser;

    //console.log("localUser barra: " + JSON.stringify(localUser));
    //console.log("currentUser: barra" + JSON.stringify(firebaseUser));

    if (localUser != null && firebaseUser != null) {
      const localEmail = localUser[parentsParameters.EMAIL[languageCode]];
      // if the local storage user is old, update the nav bar with the new user (fetching it from firestore)
      if (localEmail !== firebaseUser.email) {
        //console.log("fetch na barra");
        fetchUserDoc(firebaseUser.email)
          .then((result) => {
            //console.log("Result userDoc: " + JSON.stringify(result));
            if (result.error == null) {
              // no error
              const displayName = result[parentsParameters.NAME[languageCode]];
              const photoURL = result[parentsParameters.PHOTO[languageCode]];
              const isAdmin = result[parentsParameters.ADMIN[languageCode]];
              this.setState({ userName: displayName, userPhoto: photoURL, isAdmin : isAdmin });
            }
          })
          .catch((error) => {
            //console.log("error no fetch da barra: " + JSON.stringify(error));
          });
      } else {
        //console.log("aproveitar o storage");
        const displayName = localUser[parentsParameters.NAME[languageCode]];
        const photoURL = localUser[parentsParameters.PHOTO[languageCode]];
        const isAdmin = localUser[parentsParameters.ADMIN[languageCode]];
        this.setState({ userName: displayName, userPhoto: photoURL, isAdmin : isAdmin });
      }
    }
    else if(localUser!=null) {
      //console.log("aproveitar o storage");
      const displayName = localUser[parentsParameters.NAME[languageCode]];
      const photoURL = localUser[parentsParameters.PHOTO[languageCode]];
      const isAdmin = localUser[parentsParameters.ADMIN[languageCode]];
      this.setState({ userName: displayName, userPhoto: photoURL, isAdmin : isAdmin });
    }
    else if(firebaseUser!=null) {
      // if this code runs, then there's no user in local storage, so we have to fetch it from Firestore
      fetchUserDoc(firebaseUser.email)
        .then((result) => {
          //console.log("Result userDoc: " + JSON.stringify(result));
          if (result.error == null) {
            // no error
            const displayName = result[parentsParameters.NAME[languageCode]];
            const photoURL = result[parentsParameters.PHOTO[languageCode]];
            const isAdmin = result[parentsParameters.ADMIN[languageCode]];
            this.setState({ userName: displayName, userPhoto: photoURL, isAdmin : isAdmin });
          }
        })
        .catch((error) => {
          //console.log("error no fetch da barra: " + JSON.stringify(error));
        });
    }
  }

  render() {
    return (
      <NavItem tag={Dropdown} caret toggle={this.toggleUserActions}>
        <DropdownToggle caret tag={NavLink} className="text-nowrap px-3">
          <img
            className="user-avatar rounded-circle mr-2"
            src={this.state.userPhoto}
            alt="User photo"
          />{" "}
          <span className="d-none d-md-inline-block">
            {this.state.userName}
          </span>
        </DropdownToggle>
        <Collapse tag={DropdownMenu} right small open={this.state.visible}>
          <DropdownItem tag={Link} to="profile">
            <i className="material-icons">&#xE7FD;</i>{" "}
            {profilePageTitle[languageCode]}
          </DropdownItem>
          <DropdownItem tag={Link} to="profile-settings">
            <i className="material-icons">&#xE8B8;</i>{" "}
            {profileSettings[languageCode]}{" "}
            {/*TODO: to export its data and delete account*/}
          </DropdownItem>
          {/* render admin option only if the user is admin */}
          {this.state.isAdmin ?
            <DropdownItem tag={Link} to="admin-settings">
              <i className="material-icons">vpn_key</i>{" "}
              {profileSettingsAdminSectionTitle[languageCode]}{" "}
              {/* TODO: export assotiation data */}
            </DropdownItem>
          :
          null}
          <DropdownItem divider />
          <DropdownItem tag={Link} onClick={userLogOut} className="text-danger">
            <i className="material-icons text-danger">&#xE879;</i>{" "}
            {profileLogout[languageCode]}
          </DropdownItem>
        </Collapse>
      </NavItem>
    );
  }

}

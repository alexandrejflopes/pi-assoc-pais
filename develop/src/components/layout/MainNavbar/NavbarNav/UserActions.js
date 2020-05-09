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
  Row
} from "shards-react";
import {
  defaultAvatar,
  languageCode,
  parentsParameters
} from "../../../../utils/general_utils";
import {
  profileLogout,
  profilePageTitle,
  profileSettings
} from "../../../../utils/page_titles_strings";
import {
  fetchUserDoc,
  userLogOut
} from "../../../../firebase_scripts/profile_functions";
import {firebase_auth} from "../../../../firebase-config";

export default class UserActions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      userName : "ND",
      userPhoto : defaultAvatar
    };

    this.toggleUserActions = this.toggleUserActions.bind(this);
    this.updateNavBarUserPhotoAndName = this.updateNavBarUserPhotoAndName.bind(this);
    //this.updateNavBarUserPhotoAndNameV2 = this.updateNavBarUserPhotoAndNameV2.bind(this);
  }

  /*********************************** LIFECYCLE ***********************************/
  componentDidMount() {
    this._isMounted = true;

    this.updateNavBarUserPhotoAndName();
    //this.updateNavBarUserPhotoAndNameV2();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  toggleUserActions() {
    this.setState({
      visible: !this.state.visible
    });
  }

  updateNavBarUserPhotoAndNameV2(){
    let currentUser = JSON.parse(window.localStorage.getItem("userDoc"));
    console.log("local User barra: " + currentUser);
    if(currentUser!=null){

      const displayName = currentUser[parentsParameters.NAME[languageCode]];
      const photoURL = currentUser[parentsParameters.PHOTO[languageCode]];

      this.setState({ userName: displayName, userPhoto: photoURL });

    }
  }


  updateNavBarUserPhotoAndName(){

    // check the local storage to see if it's still the same user
    let localUser = JSON.parse(window.localStorage.getItem("userDoc"));
    let firebaseUser = firebase_auth.currentUser;

    console.log("localUser barra: " + JSON.stringify(localUser));
    console.log("currentUser: barra" + JSON.stringify(firebaseUser));

    if(localUser!=null && firebaseUser!=null){
      const localEmail = localUser[parentsParameters.EMAIL[languageCode]];
      // if the local storage user is old, update the nav bar with the new user (fetching it from firestore)
      if(localEmail!==firebaseUser.email){
        //console.log("fetch na barra");
        fetchUserDoc(firebaseUser.email)
          .then((result) => {
            console.log("Result userDoc: " + JSON.stringify(result));
            if(result.error == null){ // no error
              const displayName = result[parentsParameters.NAME[languageCode]];
              const photoURL = result[parentsParameters.PHOTO[languageCode]];
              this.setState({ userName: displayName, userPhoto: photoURL });
            }
          })
          .catch((error) => {
            console.log("error no fetch da barra: " + JSON.stringify(error));
          });
      }
      else{
        //console.log("aproveitar o storage");
        const displayName = localUser[parentsParameters.NAME[languageCode]];
        const photoURL = localUser[parentsParameters.PHOTO[languageCode]];

        this.setState({ userName: displayName, userPhoto: photoURL });
      }
    }
  }


  render() {
    return (
      <NavItem tag={Dropdown} caret toggle={this.toggleUserActions}>
        <DropdownToggle caret tag={NavLink} className="text-nowrap px-3" >
          <img
            className="user-avatar rounded-circle mr-2"
            src={this.state.userPhoto}
            alt="User photo"
          />{" "}
          <span className="d-none d-md-inline-block">{this.state.userName}</span>
        </DropdownToggle>
        <Collapse tag={DropdownMenu} right small open={this.state.visible}>
          <DropdownItem tag={Link} to="profile">
            <i className="material-icons">&#xE7FD;</i> {profilePageTitle[languageCode]}
          </DropdownItem>
          <DropdownItem tag={Link} to="edit-user-profile">
            <i className="material-icons">&#xE8B8;</i> {profileSettings[languageCode]} {/*TODO: to export its data and delete account*/}
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem tag={Link} to="/" onClick={userLogOut} className="text-danger">
            <i className="material-icons text-danger">&#xE879;</i> {profileLogout[languageCode]}
          </DropdownItem>
        </Collapse>
      </NavItem>
    );
  }
}

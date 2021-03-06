import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  facebookAuth,
  getUserData,
  signOut,
} from '../actions';
import SignIn from './signin';
import SignUp from './signup';
import UserData from './user-data';
import UpdateUserData from './update-user-data';

const mapStateToProps = (state) => ({
  users: state.users,
});

// example class based component (smart component)
class Users extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      signInToggled: false,
      signUpToggled: false,
      facebookAuthToggled: false,
      updateUserDataToggled: false,
      userDataToggled: false,
    };
  }

  componentWillReceiveProps(props) {
    if (!props.toggled && this.props.toggled) {
      this.setState({
        signInToggled: false,
        signUpToggled: false,
        facebookAuthToggled: false,
        userDataToggled: false,
      });
    }

    if (props.users.error !== null &&
        props.users.error !== this.props.users.error) {
      this.props.displayError(props.users.error, 'user');
    }
  }

  render() {
    return (
      <div id="users">
        <div
          className={`large-tab${this.props.toggled ? ' active' : ''}`}
          onClick={() => { this.props.toggle('users'); }}
        >Users</div>
        <div className="tab" onClick={() => {
          this.setState({
            signInToggled: !this.state.signInToggled,
            signUpToggled: false,
            facebookAuthToggled: false,
            updateUserDataToggled: false,
            userDataToggled: false,
          });
        }}>Sign In</div>
        <SignIn
          displayError={this.props.displayError}
          toggled={this.state.signInToggled}
        />
        <div className="tab" onClick={() => {
          this.setState({
            signInToggled: false,
            signUpToggled: !this.state.signUpToggled,
            facebookAuthToggled: false,
            updateUserDataToggled: false,
            userDataToggled: false,
          });
        }}>Sign Up</div>
        <SignUp
          displayError={this.props.displayError}
          toggled={this.state.signUpToggled}
        />
        <div className="tab" onClick={() => {
          this.setState({
            signInToggled: false,
            signUpToggled: false,
            facebookAuthToggled: false,
            updateUserDataToggled: !this.state.updateUserDataToggled,
            userDataToggled: false,
          });
        }}>Update user data</div>
        <UpdateUserData
          displayError={this.props.displayError}
          toggled={this.state.updateUserDataToggled}
        />
        <div className="tab" onClick={() => {
          if (!this.state.userDataToggled) { this.props.getUserData(); }

          this.setState({
            signInToggled: false,
            signUpToggled: false,
            facebookAuthToggled: false,
            updateUserDataToggled: false,
            userDataToggled: !this.state.userDataToggled,
          });
        }}>User Data</div>
        <UserData
          displayError={this.props.displayError}
          toggled={this.state.userDataToggled}
          userData={this.props.users.data}
        />
        <div className="tab" onClick={() => {
          this.setState({
            signInToggled: false,
            signUpToggled: false,
            facebookAuthToggled: false,
            updateUserDataToggled: false,
            userDataToggled: false,
          });

          this.props.signOut();
        }}>Sign Out</div>
      </div>
    );
  }
}

export default connect(mapStateToProps, {
  facebookAuth,
  getUserData,
  signOut,
})(Users);

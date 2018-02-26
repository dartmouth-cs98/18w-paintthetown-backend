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
            userDataToggled: false,
          });
        }}>Sign In</div>
        <SignIn toggled={this.state.signInToggled} />
        <div className="tab" onClick={() => {
          this.setState({
            signInToggled: false,
            signUpToggled: !this.state.signUpToggled,
            facebookAuthToggled: false,
            userDataToggled: false,
          });
        }}>Sign Up</div>
        <SignUp toggled={this.state.signUpToggled} />
        <div className="tab" onClick={() => {
          if (!this.state.userDataToggled) { this.props.getUserData(); }

          this.setState({
            signInToggled: false,
            signUpToggled: false,
            facebookAuthToggled: false,
            userDataToggled: !this.state.userDataToggled,
          });
        }}>User Data</div>
        <UserData toggled={this.state.userDataToggled} userData={this.props.users.data} />
        <div className="tab" onClick={() => {
          this.setState({
            signInToggled: false,
            signUpToggled: false,
            facebookAuthToggled: false,
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

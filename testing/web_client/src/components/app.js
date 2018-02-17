import React, { Component } from 'react';
import { connect } from 'react-redux';

import { facebookAuth, getUserData } from '../actions';
import SignIn from './signin';
import SignUp from './signup';
import UserData from './user-data';

const mapStateToProps = (state) => ({
  users: state.users,
});

// example class based component (smart component)
class App extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      signInToggled: false,
      signUpToggled: false,
      userDataToggled: false,
    };
  }

  render() {
    return (
      <div id="main-container">
        <div className="tab" onClick={() => {
          this.setState({
            signInToggled: !this.state.signInToggled,
            signUpToggled: false,
            userDataToggled: false,
          });
        }}>Sign In</div>
        <SignIn toggled={this.state.signInToggled} />
        <div className="tab" onClick={() => {
          this.setState({
            signInToggled: false,
            signUpToggled: !this.state.signUpToggled,
            userDataToggled: false,
          });
        }}>Sign Up</div>
        <SignUp toggled={this.state.signUpToggled} />
        <div className="tab" onClick={this.props.facebookAuth}>Facebook</div>
        <div className="tab" onClick={() => {
          if (!this.state.userDataToggled) { this.props.getUserData(); }

          this.setState({
            signInToggled: false,
            signUpToggled: false,
            userDataToggled: !this.state.userDataToggled,
          });
        }}>User Data</div>
        <UserData toggled={this.state.userDataToggled} userData={this.props.users.data} />
      </div>
    );
  }
}

export default connect(mapStateToProps, { facebookAuth, getUserData })(App);

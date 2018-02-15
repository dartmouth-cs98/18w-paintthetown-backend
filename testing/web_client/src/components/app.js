import React, { Component } from 'react';

import SignIn from './signin';
import SignUp from './signup';
import Facebook from './facebook-signup';

// example class based component (smart component)
class App extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      signInToggled: false,
      signUpToggled: false,
      facebookToggled: false,
    };
  }

  render() {
    return (
      <div id="main-container">
        <div className="tab" onClick={() => {
          this.setState({
            signInToggled: !this.state.signInToggled,
            signUpToggled: false,
            facebookToggled: false,
          });
        }}>Sign In</div>
        <SignIn toggled={this.state.signInToggled} />
        <div className="tab" onClick={() => {
          this.setState({
            signInToggled: false,
            signUpToggled: !this.state.signUpToggled,
            facebookToggled: false,
          });
        }}>Sign Up</div>
        <SignUp toggled={this.state.signUpToggled} />
        <div className="tab" onClick={() => {
          this.setState({
            signInToggled: false,
            signUpToggled: false,
            facebookToggled: !this.state.facebookToggled,
          });
        }}>Facebook</div>
        <Facebook toggled={this.state.facebookToggled} />
      </div>
    );
  }
}

export default App;

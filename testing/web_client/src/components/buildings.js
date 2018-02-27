import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  facebookAuth,
  getUserData,
  signOut,
} from '../actions';

import NewBuilding from './new-building';

const mapStateToProps = (state) => ({
  users: state.users,
});

// example class based component (smart component)
class Buildings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newBuildingToggled: false,
    };
  }

  componentWillReceiveProps(props) {

  }

  render() {
    return (
      <div id="buildings">
        <div
          className={`large-tab${this.props.toggled ? ' active' : ''}`}
          onClick={() => { this.props.toggle('buildings'); }}
        >Buildings</div>
        <div className="tab" onClick={() => {
          this.setState({ newBuildingToggled: !this.state.newBuildingToggled });
        }}>New Building</div>
        <NewBuilding toggled={this.state.newBuildingToggled} />
        <div className="tab" onClick={() => { }}>Get Location Info</div>
      </div>
    );
  }
}

export default connect(mapStateToProps, {
  facebookAuth,
  getUserData,
  signOut,
})(Buildings);

import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  newBuilding,
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
    if (!props.toggled && this.props.toggled) {
      this.setState({
        newBuildingToggled: false,
      });
    }
  }

  render() {
    return (
      localStorage.getItem('token') !== null ? (
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
      ) : (
        <div id="buildings">
          <div
            className={`large-tab${this.props.toggled ? ' active' : ''}`}
            onClick={() => { this.props.toggle('buildings'); }}
          >Colors</div>
          <h1>No token available</h1>
        </div>
      )
    );
  }
}

export default connect(mapStateToProps, {
  newBuilding,
})(Buildings);

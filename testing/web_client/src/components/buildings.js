import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  getBuildingIDs,
} from '../actions';

import NewBuilding from './new-building';
import GetLocationInfo from './get-location-info';

const mapStateToProps = (state) => ({
  buildings: state.buildings,
});

// example class based component (smart component)
class Buildings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newBuildingToggled: false,
      getLocationInfoToggled: false,
    };
  }

  componentWillReceiveProps(props) {
    if (!props.toggled && this.props.toggled) {
      this.setState({
        newBuildingToggled: false,
        getLocationInfoToggled: false,
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
            this.setState({
              newBuildingToggled: !this.state.newBuildingToggled,
              getLocationInfoToggled: false,
            });
          }}>New Building</div>
          <NewBuilding
            displayError={this.props.displayError}
            toggled={this.state.newBuildingToggled}
          />
          <div className="tab" onClick={() => {
            if (!this.state.getLocationInfoToggled) {
              this.props.getBuildingIDs(0);
            }

            this.setState({
              newBuildingToggled: false,
              getLocationInfoToggled: !this.state.getLocationInfoToggled,
            });
          }}>Get Location Info</div>
          <GetLocationInfo
            displayError={this.props.displayError}
            toggled={this.state.getLocationInfoToggled}
          />
        </div>
      ) : (
        <div id="buildings">
          <div
            className={`large-tab${this.props.toggled ? ' active' : ''}`}
            onClick={() => { this.props.toggle('buildings'); }}
          >Buildings</div>
          <h1>No token available</h1>
        </div>
      )
    );
  }
}

export default connect(mapStateToProps, {
  getBuildingIDs,
})(Buildings);

import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  getTeamIDs,
  getUserIDs,
} from '../actions';

import GetTeamInfo from './get-team-info';
import AssignUserToTeam from './assign-user-to-team';

const mapStateToProps = (state) => ({
  buildings: state.buildings,
});

// example class based component (smart component)
class Teams extends Component {
  constructor(props) {
    super(props);

    this.state = {
      getTeamInfoToggled: false,
      assignUserToTeamToggled: false,
    };
  }

  componentWillReceiveProps(props) {
    if (!props.toggled && this.props.toggled) {
      this.setState({
        getTeamInfoToggled: false,
      });
    }
  }

  render() {
    return (
      localStorage.getItem('token') !== null ? (
        <div id="teams">
          <div
            className={`large-tab${this.props.toggled ? ' active' : ''}`}
            onClick={() => { this.props.toggle('teams'); }}
          >Teams</div>
          <div className="tab" onClick={() => {
            if (!this.state.getTeamInfoToggled) {
              this.props.getTeamIDs(0);
            }

            this.setState({
              getTeamInfoToggled: !this.state.getTeamInfoToggled,
              assignUserToTeamToggled: false,
            });
          }}>Get Info</div>
          <GetTeamInfo
            displayError={this.props.displayError}
            toggled={this.state.getTeamInfoToggled}
          />
          <div className="tab" onClick={() => {
            if (!this.state.getTeamInfoToggled) {
              this.props.getTeamIDs(0);
            }

            this.setState({
              getTeamInfoToggled: false,
              assignUserToTeamToggled: !this.state.assignUserToTeamToggled,
            });
          }}>Assign User to Team</div>
          <AssignUserToTeam
            displayError={this.props.displayError}
            toggled={this.state.assignUserToTeamToggled}
          />
        </div>
      ) : (
        <div id="teams">
          <div
            className={`large-tab${this.props.toggled ? ' active' : ''}`}
            onClick={() => { this.props.toggle('teams'); }}
          >Teams</div>
          <h1>No token available</h1>
        </div>
      )
    );
  }
}

export default connect(mapStateToProps, {
  getTeamIDs,
  getUserIDs,
})(Teams);

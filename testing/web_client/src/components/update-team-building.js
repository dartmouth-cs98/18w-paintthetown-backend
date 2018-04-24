import React, { Component } from 'react';
import { connect } from 'react-redux';

import { updateTeamBuilding } from '../actions';

const mapStateToProps = ({ buildings, teams }) => ({ buildings, teams });

// example class based component (smart component)
class UpdateTeamBuilding extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      building: null,
      team: null,
      data: {},
      buildingColor: '#000000',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getBuildingIDs = this.getBuildingIDs.bind(this);
    this.getTeamIDs = this.getTeamIDs.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.buildings.error !== null &&
        props.buildings.error !== this.props.buildings.error) {
      this.props.displayError(props.buildings.error, 'building');
    }

    if (props.buildings.latestBuilding !== null &&
        props.buildings.latestBuilding !== this.props.buildings.latestBuilding) {
      this.setState({ buildingColor: props.buildings.latestBuilding.hex });
    }

    if (props.buildings.buildings !== null &&
        this.props.buildings.buildings !== props.buildings.buildings) {
      const data = {};

      props.buildings.buildings.forEach(({ id, hex }) => {
        data[id] = hex;
      });

      this.setState({ data });
    }
  }

  onChange(e, type) {
    const val = e.target.value;
    const state = this.state;

    state[type] = val === 'default' ? null : val;
    state[`${type}Color`] = state.data[val];

    this.setState(state);
  }

  getBuildingIDs() {
    if (this.props.buildings.buildings === null) {
      return <option value="Loading...">Loading...</option>;
    }

    return [{ id: 'Select building id...', hex: null }]
    .concat(this.props.buildings.buildings)
    .map(({ id }) => {
      return <option
        value={id === 'Select building id...' ? 'default' : id}
        key={id}
      >{id}</option>;
    });
  }

  getTeamIDs() {
    if (this.props.teams.teams === null) {
      return <option value="Loading...">Loading...</option>;
    }

    return ['Select team color...'].concat(this.props.teams.teams)
    .map(team => (team.length ?
      <option value={team} key={team}>{team}</option> :
      <option value={team.id} key={team.id}>{team.color}</option>)
    );
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.updateTeamBuilding(this.state);
  }

  render() {
    return (
      <div id="update-building-team" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <select
            onChange={(e) => { this.onChange(e, 'building'); }}
            disabled={this.props.buildings.buildings === null}
            style={{ backgroundColor: this.state.buildingColor === '#000000' ? '#ffffff' : this.state.buildingColor }}
          >{this.getBuildingIDs()}</select>
          <select
            onChange={(e) => { this.onChange(e, 'team'); }}
            disabled={this.props.buildings.buildings === null}
          >{this.getTeamIDs()}</select>
          <input
            type="submit"
            disabled={this.state.building === null || this.state.team === null}
            value="Update"
          />
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps, {
  updateTeamBuilding,
})(UpdateTeamBuilding);

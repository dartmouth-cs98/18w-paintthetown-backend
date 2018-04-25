import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getTeamInfo } from '../actions';

const mapStateToProps = (state) => (
  {
    teams: state.teams,
  }
);

// example class based component (smart component)
class GetTeamInfo extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      id: null,
      field: null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.getTeamIDs = this.getTeamIDs.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.teams.error !== null &&
        props.teams.error !== this.props.teams.error) {
      this.props.displayError(props.teams.error, 'teams');
    }
  }

  onChange(e) {
    const val = e.target.value;

    this.setState({ id: val === 'Select team id...' ? null : val });
  }

  onFieldChange(e) {
    const val = e.target.value;

    this.setState({ field: val === 'default' ? null : val });
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

    this.props.getTeamInfo(this.state.id, this.state.field);
  }

  render() {
    return (
      <div id="get-team-info" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <select
            onChange={this.onChange}
            disabled={this.props.teams.teams === null}
          >{this.getTeamIDs()}</select>
          <select onChange={this.onFieldChange}>
            <option value="default">Select field...</option>
            <option value="name">Name</option>
            <option value="type">Type</option>
            <option value="color">Color</option>
            <option value="nMembers">Number of members</option>
            <option value="nBuildings">Number of buildings owned</option>
          </select>
          <input
            type="submit"
            disabled={this.state.id === null || this.state.field === null}
            value="Submit"
          />
        </form>
        <h1>{
          this.props.teams.latestTeam.info === null ?
          ' ' :
          `${this.props.teams.latestTeam.info.field}: ${this.props.teams.latestTeam.info.data}`
        }</h1>
      </div>
    );
  }
}

export default connect(mapStateToProps, { getTeamInfo })(GetTeamInfo);

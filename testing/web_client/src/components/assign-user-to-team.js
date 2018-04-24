import React, { Component } from 'react';
import { connect } from 'react-redux';

import { assignUserToTeam } from '../actions';

const mapStateToProps = (state) => (
  {
    teams: state.teams,
  }
);

// example class based component (smart component)
class AssignUserToTeam extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      team: null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
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

    this.setState({ team: val === 'Select team id...' ? null : val });
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

    this.props.assignUserToTeam(this.state.team);
  }

  render() {
    return (
      <div id="assign-user-to-team" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <select
            onChange={this.onChange}
            disabled={this.props.teams.teams === null}
          >{this.getTeamIDs()}</select>
          <input
            type="submit"
            disabled={this.state.team === null || this.state.user === null}
            value="Submit"
          />
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps, { assignUserToTeam })(AssignUserToTeam);

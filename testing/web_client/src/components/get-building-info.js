import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getBuildingInfo } from '../actions';

const mapStateToProps = (state) => (
  {
    buildings: state.buildings,
  }
);

// example class based component (smart component)
class GetBuildingInfo extends Component {
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
    this.getBuildingIDs = this.getBuildingIDs.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.buildings.error !== null &&
        props.buildings.error !== this.props.buildings.error) {
      this.props.displayError(props.buildings.error, 'building');
    }
  }

  onChange(e) {
    const val = e.target.value;

    this.setState({ id: val === 'Select building id...' ? null : val });
  }

  onFieldChange(e) {
    const val = e.target.value;

    this.setState({ field: val === 'default' ? null : val });
  }

  getBuildingIDs() {
    if (this.props.buildings.buildings === null) {
      return <option value="Loading...">Loading...</option>;
    }

    return [{ id: 'Select building id...' }]
    .concat(this.props.buildings.buildings)
    .map(({ id }) => (
      <option value={id} key={id}>{id}</option>
    ));
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.getBuildingInfo(this.state.id, this.state.field);
  }

  render() {
    return (
      <div id="get-building-info" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <select
            onChange={this.onChange}
            disabled={this.props.buildings.buildings === null}
          >{this.getBuildingIDs()}</select>
          <select onChange={this.onFieldChange}>
            <option value="default">Select field...</option>
            <option value="name">Name</option>
            <option value="description">Description</option>
            <option value="ownership">Ownership</option>
            <option value="rgb">RGB</option>
            <option value="hex">Hex</option>
            <option value="tags">Tags</option>
            <option value="centroid">Centroid</option>
            <option value="baseAltitude">Base Altitude</option>
            <option value="topAltitude">Top Altitude</option>
            <option value="city">City</option>
            <option value="team">Team</option>
          </select>
          <input
            type="submit"
            disabled={this.state.id === null || this.state.field === null}
            value="Submit"
          />
        </form>
        <h1>{
          this.props.buildings.latestBuilding.info === null ?
          ' ' :
          `${this.props.buildings.latestBuilding.info.field}: ${this.props.buildings.latestBuilding.info.data}`
        }</h1>
      </div>
    );
  }
}

export default connect(mapStateToProps, { getBuildingInfo })(GetBuildingInfo);

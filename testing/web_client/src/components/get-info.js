import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getInfo } from '../actions';

const mapStateToProps = (state) => (
  {
    buildings: state.buildings,
  }
);

// example class based component (smart component)
class GetInfo extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      id: null,
      fields: null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
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

  getBuildingIDs() {
    if (this.props.buildings.buildings === null) {
      return <option value="Loading...">Loading...</option>;
    }

    return ['Select building id...'].concat(this.props.buildings.buildings)
    .map(id => (
      <option value={id} key={id}>{id}</option>
    ));
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.getInfo(this.state.id, this.state.fields);
  }

  render() {
    return (
      <div id="get-info" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <select
            onChange={this.onChange}
            disabled={this.props.buildings.buildings === null}
          >{this.getBuildingIDs()}</select>
          <input
            type="submit"
            disabled={this.state.id === null}
            value="Submit"
          />
        </form>
        <h1>{
          this.props.buildings.latestBuilding.centroid === null ?
          ' ' :
          `${this.props.buildings.latestBuilding.centroid}`
        }</h1>
      </div>
    );
  }
}

export default connect(mapStateToProps, { getInfo })(GetInfo);

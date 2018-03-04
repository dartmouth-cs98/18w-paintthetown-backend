import React, { Component } from 'react';
import { connect } from 'react-redux';

import { newBuilding } from '../actions';

import { inRange } from '../../../../app/utils';

function isComplete(data) {
  const arr = Object.values(data);

  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] === null || arr[i].length === 0) {
      return false;
    }
  }

  return parseFloat(data.topAltitude) > parseFloat(data.baseAltitude);
}

const mapStateToProps = (state) => (
  {
    buildings: state.buildings,
  }
);

const validateLngLat = (val) => (val.length === 0 || inRange(val, -180, 180));

const validateAltidude = (base, top) => (
  top === null || base === null || top.length === 0 || base.length === 0 ||
  parseFloat(base) < parseFloat(top)
);

const validators = {
  centroidLng: validateLngLat,
  centroidLat: validateLngLat,
  topAltitude: validateAltidude,
};

// example class based component (smart component)
class NewBuilding extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      data: {
        name: '',
        centroidLng: null,
        centroidLat: null,
        baseAltitude: null,
        topAltitude: null,
      },
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.buildings.error !== null &&
        props.buildings.error !== this.props.buildings.error) {
      this.props.displayError(props.buildings.error, 'building');
    }
  }

  onChange(type, e) {
    const { data } = this.state;

    if (type !== 'baseAltitude' &&
        !Object.prototype.hasOwnProperty.call(validators, type)) {
      data[type] = e.target.value;
    } else if (type === 'baseAltitude') {
      data[type] = e.target.value;

      if (data.topAltitude === null ||
          parseFloat(data.topAltitude) < parseFloat(data[type])) {
        data.topAltitude = e.target.value;
      }
    } else if (type === 'topAltitude' || validators[type](e.target.value)) {
      data[type] = e.target.value;
    }

    this.setState({ data, isComplete: isComplete(data) });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.newBuilding(this.state.data);
  }

  render() {
    return (
      <div id="new-building" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <input autoComplete="on" type="text" placeholder="* Name" value={this.state.data.name} onChange={e => { this.onChange('name', e); }} />
          <input
            autoComplete="on"
            type="number"
            placeholder="* Centroid Longitude"
            min="-180"
            max="180"
            step="1e-6"
            value={
              this.state.data.centroidLng === null ?
              '' :
              this.state.data.centroidLng
            }
            onChange={e => { this.onChange('centroidLng', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="* Centroid Latitude"
            min="-180"
            max="180"
            step="1e-6"
            value={
              this.state.data.centroidLat === null ?
              '' :
              this.state.data.centroidLat
            }
            onChange={e => { this.onChange('centroidLat', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="* Base Altitude"
            min="0"
            step="1e-6"
            value={
              this.state.data.baseAltitude === null ?
              '' :
              this.state.data.baseAltitude
            }
            onChange={e => { this.onChange('baseAltitude', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="* Top Altitude"
            min={this.state.baseAltitude === null ? '0' : this.state.baseAltitude}
            step="1e-6"
            value={
              this.state.data.topAltitude === null ?
              '' :
              this.state.data.topAltitude
            }
            onChange={e => { this.onChange('topAltitude', e); }}
          />
          <input type="submit" value="Submit" disabled={!this.state.isComplete} />
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps, { newBuilding })(NewBuilding);

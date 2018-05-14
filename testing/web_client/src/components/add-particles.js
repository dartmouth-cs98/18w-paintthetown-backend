import React, { Component } from 'react';
import { connect } from 'react-redux';

import { addParticles, getColorIDs, getBuildingIDs } from '../actions';



function isComplete(data) {
  const arr = Object.values(data);

  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] === 0 || arr[i].length === 0) { return false; }
  }

  return true;
}

const mapStateToProps = (state) => (
  {
    particles: state.particles,
    buildings: state.buildings,
    colors: state.colors,
  }
);
//
// const validateRGB = (val) => (val.length > 0 && inRange(val, 0, 255));
//
// const validators = {
//   r: validateRGB,
//   g: validateRGB,
//   b: validateRGB,
// };

// example class based component (smart component)
class AddParticles extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      data: {
        pos1: 0,
        pos2: 0,
        pos3: 0,
        size: 0,
        rot1: 0,
        rot2: 0,
        rot3: 0,
        color: '',
        building: '',
      },
      isComplete: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.error !== null &&
        props.error !== this.props.error) {
      this.props.displayError(props.error, 'particles');
    }
  }

  onChange(type, e) {
    const { data } = this.state;

    data[type] = e.target.value;

    this.setState({ data, isComplete: isComplete(data) });
  }

  handleSubmit(e) {
    const pos = [this.state.pos1, this.state.pos2, this.state.pos3];
    const rotation = [this.state.rot1, this.state.rot2, this.state.rot3];

    e.preventDefault();

    this.props.addParticles(Object.assign(this.state.data, { pos, rotation }));
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

  getColorIDs() {
    if (this.props.colors.colors === null) {
      return <option value="Loading...">Loading...</option>;
    }

    return ['Select color id...'].concat(this.props.colors.colors)
    .map(id => (
      <option value={id} key={id}>{id}</option>
    ));
  }

  render() {
    return (
      <div id="add-particles" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <input
            autoComplete="on"
            type="number"
            placeholder="pos1"
            step="1"
            value={this.state.data.pos1}
            onChange={e => { this.onChange('pos1', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="pos2"
            step="1"
            value={this.state.data.pos2}
            onChange={e => { this.onChange('pos2', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="pos3"
            step="1"
            value={this.state.data.pos3}
            onChange={e => { this.onChange('pos3', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="size"
            step="1"
            value={this.state.data.size}
            onChange={e => { this.onChange('size', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="rot1"
            step="1"
            value={this.state.data.rot1}
            onChange={e => { this.onChange('rot1', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="rot2"
            step="1"
            value={this.state.data.rot2}
            onChange={e => { this.onChange('rot2', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="rot3"
            step="1"
            value={this.state.data.rot3}
            onChange={e => { this.onChange('rot3', e); }}
          />
          <select
            onChange={(e) => { this.onChange('color',e); }} //e, 'colors'
            disabled={this.props.colors.colors === null}
          >{this.getColorIDs()}</select>
          <select
            onChange={(e) => { this.onChange('building',e); }}  //e, 'building'
            disabled={this.props.buildings.buildings === null}
          >{this.getBuildingIDs()}</select>

          <input type="submit" value="Submit" disabled={!this.state.isComplete} />
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps, { addParticles, getBuildingIDs, getColorIDs })(AddParticles);

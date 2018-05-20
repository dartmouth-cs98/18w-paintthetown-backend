import React, { Component } from 'react';
import { connect } from 'react-redux';

import { addParticles, getColorIDs, getBuildingIDs } from '../actions';



function isComplete(data) {
  const arr = Object.values(data);

  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] === 'default' || arr[i] === 0 || arr[i].length === 0) {
      return false;
    }
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
    if (props.particles.error !== null &&
        props.particles.error !== this.props.particles.error) {
      this.props.displayError(props.particles.error, 'particles');
    }

    if (props.buildings.error !== null &&
        props.buildings.error !== this.props.buildings.error) {
      this.props.displayError(props.buildings.error, 'buildings');
    }

    if (props.colors.error !== null &&
        props.colors.error !== this.props.colors.error) {
      this.props.displayError(props.colors.error, 'colors');
    }
  }

  onChange(type, e) {
    const { data } = this.state;

    data[type] = e.target.value;

    this.setState({ data, isComplete: isComplete(data) });
  }

  getBuildingIDs() {
    if (this.props.buildings.buildings === null) {
      return <option value="Loading...">Loading...</option>;
    }

    return [{ id: 'Select building id...', hex: null }]
    .concat(this.props.buildings.buildings)
    .map(({ id }) => (
      <option
        value={id === 'Select building id...' ? 'default' : id}
        key={id}
      >{id}</option>
    ));
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

  handleSubmit(e) {
    const { data: {
      pos1,
      pos2,
      pos3,
      rot1,
      rot2,
      rot3,
      building,
      color,
    } } = this.state;
    const pos = [pos1, pos2, pos3];
    const rotation = [rot1, rot2, rot3];
    const particles = [{ pos, rotation, building, color }];

    e.preventDefault();

    this.props.addParticles(particles);
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
            onChange={(e) => { this.onChange('color', e); }} // e, 'colors'
            disabled={this.props.colors.colors === null}
          >{this.getColorIDs()}</select>
          <select
            onChange={(e) => { this.onChange('building', e); }}  // e, 'building'
            disabled={this.props.buildings.buildings === null}
          >{this.getBuildingIDs()}</select>

          <input type="submit" value="Submit" disabled={!this.state.isComplete} />
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps, {
  addParticles,
  getBuildingIDs,
  getColorIDs,
})(AddParticles);

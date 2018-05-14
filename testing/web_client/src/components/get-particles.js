import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getParticles, getBuildingIDs } from '../actions';

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

// example class based component (smart component)
class GetParticles extends Component {
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

  onChange(e) {
    const val = e.target.value;

    this.setState({ id: val === 'Select building id...' ? null : val });
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

  handleSubmit(e) {
    e.preventDefault();

    this.props.getParticles(this.state.building);
  }

  render() {
    return (
      <div id="get-particles" className={this.props.toggled ? 'normal' : 'hidden'}>
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

      </div>
    );
  }
}

export default connect(mapStateToProps, { getParticles, getBuildingIDs })(GetParticles);

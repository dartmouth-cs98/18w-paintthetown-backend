import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getParticles, getBuildingIDs } from '../actions';

function isComplete({ id }) {
  return id !== null;
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
      id: null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getBuildingIDs = this.getBuildingIDs.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.error !== null &&
        props.error !== this.props.error) {
      this.props.displayError(props.error, 'particles');
    }
  }

  onChange(e) {
    const val = e.target.value;

    this.setState({ id: val === 'default' ? null : val });
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

  handleSubmit(e) {
    e.preventDefault();

    this.props.getParticles(this.state.id);
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
            disabled={!isComplete(this.state)}
            value="Submit"
          />
        </form>

      </div>
    );
  }
}

export default connect(mapStateToProps, { getParticles, getBuildingIDs })(GetParticles);

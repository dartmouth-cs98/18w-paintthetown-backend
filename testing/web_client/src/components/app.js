import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getColorData, clearError } from '../actions';

const mapStateToProps = (state) => ({
  colors: state.colors,
});


import Users from './users';
import Colors from './colors';
import Buildings from './buildings';
import Particles from './particles';
import Teams from './teams';
import Cities from './cities';
import Reset from './reset';
import ErrorWindow from './error-window';

// example class based component (smart component)
class App extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      usersToggled: false,
      colorsToggled: false,
      buildingsToggled: false,
      particlesToggled: false,
      teamsToggled: false,
      resetToggled: false,
      error: null,
    };

    this.toggle = this.toggle.bind(this);
    this.updateFontColor = this.updateFontColor.bind(this);
    this.displayError = this.displayError.bind(this);
  }

  toggle(type) {
    const state = this.state;
    const toggleLabel = `${type}Toggled`;

    state[toggleLabel] = !state[toggleLabel];

    Object.keys(state).reduce((arr, key) => (
      key === toggleLabel || key === 'error' ? arr : arr.concat(key)
    ), [])
    .forEach(key => { state[key] = false; });

    this.setState(state);
  }

  updateFontColor(id) {
    this.props.getColorData(id);
  }

  displayError(error, type) {
    this.setState({ error });

    setTimeout(() => {
      this.setState({ error: null });
      this.props.clearError(type);
    }, 4000);
  }

  render() {
    return (
      <div id="main-container" >
        <div id="tabs" style={{ color: this.props.colors.fontColor }}>
          <Users
            displayError={this.displayError}
            toggle={this.toggle}
            toggled={this.state.usersToggled}
          />
          <Colors
            displayError={this.displayError}
            toggle={this.toggle}
            toggled={this.state.colorsToggled}
            updateFontColor={this.updateFontColor}
          />
          <Buildings
            displayError={this.displayError}
            toggle={this.toggle}
            toggled={this.state.buildingsToggled}
          />
          <Particles
            displayError={this.displayError}
            toggle={this.toggle}
            toggled={this.state.particlesToggled}
          />
          <Teams
            displayError={this.displayError}
            toggle={this.toggle}
            toggled={this.state.teamsToggled}
          />
          <Cities
            displayError={this.displayError}
            toggle={this.toggle}
            toggled={this.state.citiesToggled}
          />
          <Reset
            displayError={this.displayError}
            toggle={this.toggle}
            toggled={this.state.resetToggled}
          />
        </div>
        <ErrorWindow error={this.state.error} />
      </div>
    );
  }
}

export default connect(mapStateToProps, {
  getColorData,
  clearError,
})(App);

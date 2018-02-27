import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getColorData } from '../actions';

const mapStateToProps = (state) => ({
  colors: state.colors,
});


import Users from './users';
import Colors from './colors';
import Buildings from './buildings';

// example class based component (smart component)
class App extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      usersToggled: false,
      colorsToggled: false,
      buildingsToggled: false,
    };

    this.toggle = this.toggle.bind(this);
    this.updateFontColor = this.updateFontColor.bind(this);
  }

  toggle(type) {
    const state = this.state;
    const toggleLabel = `${type}Toggled`;

    state[toggleLabel] = !state[toggleLabel];

    Object.keys(state).reduce((arr, key) => (
      key === toggleLabel ? arr : arr.concat(key)
    ), [])
    .forEach(key => { state[key] = false; });

    this.setState(state);
  }

  updateFontColor(id) {
    this.props.getColorData(id);
  }

  render() {
    return (
      <div id="main-container" style={{ color: this.props.colors.fontColor }}>
        <Users toggle={this.toggle} toggled={this.state.usersToggled} />
        <Colors
          toggle={this.toggle}
          toggled={this.state.colorsToggled}
          updateFontColor={this.updateFontColor}
        />
        <Buildings toggle={this.toggle} toggled={this.state.buildingsToggled} />
      </div>
    );
  }
}

export default connect(mapStateToProps, { getColorData })(App);

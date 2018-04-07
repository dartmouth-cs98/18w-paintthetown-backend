import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  addCity,
  newBuilding,
} from '../actions';

import AddCity from './add-city';

const mapStateToProps = ({ buildings, cities }) => ({ buildings, cities });

// example class based component (smart component)
class Cities extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addCityToggled: false,
    };
  }

  componentWillReceiveProps(props) {
    if (!props.toggled && this.props.toggled) {
      this.setState({ addCityToggled: false });
    }
  }

  render() {
    return (
      localStorage.getItem('token') !== null ? (
        <div id="cities">
          <div
            className={`large-tab${this.props.toggled ? ' active' : ''}`}
            onClick={() => { this.props.toggle('cities'); }}
          >Cities</div>
          <div className="tab" onClick={() => {
            this.setState({ addCityToggled: !this.state.addCityToggled });
          }}>Add city</div>
          <AddCity
            displayError={this.props.displayError}
            toggled={this.state.addCityToggled}
          />
        </div>
      ) : (
        <div id="cities">
          <div
            className={`large-tab${this.props.toggled ? ' active' : ''}`}
            onClick={() => { this.props.toggle('cities'); }}
          >Cities</div>
          <h1>No token available</h1>
        </div>
      )
    );
  }
}

export default connect(mapStateToProps, {
  addCity,
  newBuilding,
})(Cities);

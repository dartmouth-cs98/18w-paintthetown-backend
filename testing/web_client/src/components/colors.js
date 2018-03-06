import React, { Component } from 'react';
import { connect } from 'react-redux';

import NewColor from './new-color';
import GetColorData from './get-color-data';
import { getColorIDs } from '../actions';

const mapStateToProps = (state) => ({
  colors: state.colors,
});

// example class based component (smart component)
class Colors extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      newColorToggled: false,
      getColorDataToggled: false,
    };
  }

  componentWillReceiveProps(props) {
    if (!props.toggled && this.props.toggled) {
      this.setState({
        newColorToggled: false,
        getColorDataToggled: false,
      });
    }

    if (this.props.colors.latestID !== props.colors.latestID) {
      this.props.updateFontColor(props.colors.latestID);
    }
  }

  render() {
    return (
      localStorage.getItem('token') !== null ? (
        <div id="colors">
          <div
            className={`large-tab${this.props.toggled ? ' active' : ''}`}
            onClick={() => { this.props.toggle('colors'); }}
          >Colors</div>
          <div className="tab" onClick={() => {
            this.setState({
              newColorToggled: !this.state.newColorToggled,
              getColorDataToggled: false,
            });
          }}>New Color</div>
          <NewColor
            displayError={this.props.displayError}
            toggled={this.state.newColorToggled}
          />
          <div className="tab" onClick={() => {
            if (!this.state.getColorDataToggled) {
              this.props.getColorIDs(0);
            }

            this.setState({
              newColorToggled: false,
              getColorDataToggled: !this.state.newColorToggled,
            });
          }}>Get Color Data</div>
          <GetColorData
            displayError={this.props.displayError}
            toggled={this.state.getColorDataToggled}
          />
        </div>
      ) : (
        <div id="colors">
          <div
            className={`large-tab${this.props.toggled ? ' active' : ''}`}
            onClick={() => { this.props.toggle('colors'); }}
          >Colors</div>
          <h1>No token available</h1>
        </div>
      )
    );
  }
}

export default connect(mapStateToProps, { getColorIDs })(Colors);

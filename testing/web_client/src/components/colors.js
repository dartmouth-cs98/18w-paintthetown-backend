import React, { Component } from 'react';
import { connect } from 'react-redux';

import NewColor from './new-color';

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
    };
  }

  componentWillReceiveProps(props) {
    if (!props.toggled && this.props.toggled) {
      this.setState({
        newColorToggled: false,
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
            });
          }}>New Color</div>
          <NewColor
            displayError={this.props.displayError}
            toggled={this.state.newColorToggled}
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

export default connect(mapStateToProps, { })(Colors);

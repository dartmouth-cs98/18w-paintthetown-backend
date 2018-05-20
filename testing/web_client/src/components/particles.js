import React, { Component } from 'react';
import { connect } from 'react-redux';

import AddParticles from './add-particles';
import GetParticles from './get-particles';

import {
  addParticles,
  getParticles,
  getBuildingIDs,
  getColorIDs,
} from '../actions';


const mapStateToProps = (state) => ({
  buildings: state.buildings,
  particles: state.particles,
  colors: state.colors,
});


class Particles extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      addParticlesToggled: false,
      getParticlesToggled: false,
    };
  }

  componentWillReceiveProps(props) {
    if (!props.toggled && this.props.toggled) {
      this.setState({
        addParticlesToggled: false,
        getParticlesToggled: false,
      });
    }

    // if (this.props.colors.latestID !== props.colors.latestID) {
    //   this.props.updateFontColor(props.colors.latestID);
    // }
  }

  render() {
    return (
      localStorage.getItem('token') !== null ? (
        <div id="particles">
          <div
            className={`large-tab${this.props.toggled ? ' active' : ''}`}
            onClick={() => { this.props.toggle('particles'); }}
          >Particles</div>
          <div className="tab" onClick={() => {
            if (!this.state.getParticlesToggled) {
              this.props.getBuildingIDs(0);
              this.props.getColorIDs(0);
            }
            this.setState({
              addParticlesToggled: !this.state.addParticlesToggled,
              getParticlesToggled: false,
            });
          }}>Add Particles</div>
          <AddParticles
            displayError={this.props.displayError}
            toggled={this.state.addParticlesToggled}
          />
          <div className="tab" onClick={() => {
            if (!this.state.getParticlesToggled) {
              this.props.getBuildingIDs(0);
            }
            this.setState({
              addParticlesToggled: false,
              getParticlesToggled: !this.state.getParticlesToggled,
            });
          }}>Get Particles</div>
          <GetParticles
            displayError={this.props.displayError}
            toggled={this.state.getParticlesToggled}
          />

        </div>
      ) : (
        <div id="particles">
          <div
            className={`large-tab${this.props.toggled ? ' active' : ''}`}
            onClick={() => { this.props.toggle('particles'); }}
          >Particles</div>
          <h1>No token available</h1>
        </div>
      )
    );
  }


}

export default connect(mapStateToProps, {
  addParticles,
  getParticles,
  getBuildingIDs,
  getColorIDs,
})(Particles);

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getBuildingsBbox } from '../actions';

function isComplete(bbox) {
  for (let i = 0; i < 4; i += 1) {
    if (bbox[i] === null) { return false; }
  }

  return true;
}

const mapStateToProps = (state) => (
  {
    buildings: state.buildings,
  }
);

// example class based component (smart component)
class GetBuildingsBbox extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      bbox: [null, null, null, null],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.buildings.error !== null &&
        props.buildings.error !== this.props.buildings.error) {
      this.props.displayError(props.buildings.error, 'building');
    }
  }

  onChange(index, e) {
    const { bbox } = this.state;

    bbox[index] = e.target.value;

    this.setState({ bbox, isComplete: isComplete(bbox) });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.getBuildingsBbox(this.state.bbox);
  }

  render() {
    return (
      <div id="get-buildings-bbox" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <div id="bbox">
            <input
              autoComplete="on"
              type="number"
              min="-180"
              max="180"
              step="1e-6"
              placeholder="* Min Lng"
              value={
                this.state.bbox[0] === null ?
                0 : this.state.bbox[0]
              }
              onChange={e => { this.onChange(0, e); }}
            />
            <input
              autoComplete="on"
              type="number"
              min="-180"
              max="180"
              step="1e-6"
              placeholder="* Min Lat"
              value={
                this.state.bbox[1] === null ?
                0 : this.state.bbox[1]
              }
              onChange={e => { this.onChange(1, e); }}
            />
            <input
              autoComplete="on"
              type="number"
              min="-180"
              max="180"
              step="1e-6"
              placeholder="* Max Lng"
              value={
                this.state.bbox[2] === null ?
                0 : this.state.bbox[2]
              }
              onChange={e => { this.onChange(2, e); }}
            />
            <input
              autoComplete="on"
              type="number"
              min="-180"
              max="180"
              step="1e-6"
              placeholder="* Max Lat"
              value={
                this.state.bbox[3] === null ?
                0 : this.state.bbox[3]
              }
              onChange={e => { this.onChange(3, e); }}
            />
          </div>
          <input type="submit" value="Submit" disabled={!this.state.isComplete} />
        </form>
        <h1 className={
          this.props.buildings.buildings === null ?
          'hidden' :
          'normal'
        }>{
          this.props.buildings.buildings === null ? ''
          : `${this.props.buildings.buildings.length} buildings`
        }</h1>
      </div>
    );
  }
}

export default connect(mapStateToProps, { getBuildingsBbox })(GetBuildingsBbox);

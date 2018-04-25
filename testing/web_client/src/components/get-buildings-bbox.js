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
      teamOnly: false,
      extraFields: {},
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

    this.props.getBuildingsBbox(
      this.state.bbox,
      this.state.teamOnly,
      Object.keys(this.state.extraFields),
    );
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
          <div id="team-only" >
            <input
              autoComplete="on"
              type="checkbox"
              name="team-only"
              id="team-only-checkbox"
              value={!this.state.teamOnly}
              checked={!this.state.teamOnly}
              onChange={e => { this.setState({ teamOnly: !this.state.teamOnly }); }}
            />
            <label htmlFor="team-only-checkbox">{'Include buildings with no team'}</label>
          </div>
          <select id="extra-fields" onChange={e => {
            const { options } = e.currentTarget;

            for (let i = 0; i < options.length; i += 1) {
              const opt = options[i];
              const { extraFields } = this.state;
              const key = opt.value;

              if (Object.prototype.hasOwnProperty.call(extraFields, key)) {
                if (!opt.selected) { delete extraFields[key]; }
              } else if (opt.selected) {
                extraFields[key] = true;
              }

              this.setState({ extraFields });
            }
          }} multiple
          >
            <option value="name">Name</option>
            <option value="description">Description</option>
            <option value="rgb">RGB</option>
            <option value="hex">Hex</option>
            <option value="tags">Tags</option>
            <option value="team">Team</option>
            <option value="ownership">Ownership</option>
            <option value="city">City</option>
            <option value="centroidLng">Centroid Longitude</option>
            <option value="centroidLat">Centroid Latitude</option>
            <option value="baseAltitude">Base Altitude</option>
            <option value="topAltitude">Top Altitude</option>
          </select>
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

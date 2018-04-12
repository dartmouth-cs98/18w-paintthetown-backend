import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map, buildings } from 'wrld.js';

import { addCity, newBuildings } from '../actions';
import { hasProp } from '../../../../app/utils';
// import config from '../config';

const config = {
  WRLD3D_API_KEY: 'c0b58f7240bf36e09f110a3d41d3edee',
};

const STEP_SIZE = 0.0002;
const CITIES_PER_REQUEST = 25;

let initCoord = null;
let n = null;
let totalCalls = null;

function isComplete(data) {
  const arr = Object.values(data);

  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] === null || arr[i].length === 0) {
      return false;
    }
  }

  return data.bbox[0] !== null && data.bbox[1] !== null &&
         data.bbox[2] !== null && data.bbox[3] !== null;
}

const mapStateToProps = (state) => (
  {
    cities: state.cities,
    buildings: state.buildings,
  }
);

// example class based component (smart component)
class AddCity extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      data: {
        name: '',
        centroidLng: null,
        centroidLat: null,
        zoom: null,
        bbox: [null, null, null, null],
      },
      buildings: {},
      queue: [],
      pointer: 0,
      sentRequest: false,
      percentDone: null,
      map: null,
      lockFields: 'Submit',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.updateMap = this.updateMap.bind(this);
    this.startCityScan = this.startCityScan.bind(this);
    this.handleInformation = this.handleInformation.bind(this);
    this.continueUpload = this.continueUpload.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.cities.error !== null &&
        props.cities.error !== this.props.cities.error) {
      this.props.displayError(props.cities.error, 'city');
      this.setState({ lockFields: 'Submit' });
    }

    if (props.cities.latestCity !== null &&
        props.cities.latestCity !== this.props.cities.latestCity) {
      const bbox = this.state.bbox.map(el => (parseFloat(el)));
      const lowerLeftCorner = bbox.slice(0, 2);
      const upperRightCorner = bbox.slice(2);

      // INIT COUNTERS
      n = 0;
      initCoord = lowerLeftCorner.slice();
      totalCalls = (Math.floor(
        Math.abs(lowerLeftCorner[0] - upperRightCorner[0]) / STEP_SIZE
      ) + 1) * (Math.floor(
        Math.abs(lowerLeftCorner[1] - upperRightCorner[1]) / STEP_SIZE)
      );

      if (this.state.map === null) {
        this.startCityScan();
      } else {
        this.updateMap();

        buildings.buildingHighlight(
          buildings.buildingHighlightOptions()
          .highlightBuildingAtLocation(initCoord)
          .informationOnly()
        )
        .addTo(this.state.map);

        this.setState({ lockFields: 'Done' });
      }
    }

    if (props.buildings.offest !== this.props.buildings.offset) {
      let queue = null;

      if (this.state.queue.length > CITIES_PER_REQUEST) {
        queue = this.state.queue.slice(CITIES_PER_REQUEST);
      } else {
        queue = [];
      }

      if (this.state.pointer === -2) {
        this.setState({ queue });
        this.continueUpload();
      } else {
        this.setState({ pointer: 0, queue });
      }
    }
  }

  onChange(type, e) {
    const { data } = this.state;

    data[type] = e.target.value;

    this.setState({ data, isComplete: isComplete(data) });
  }

  startCityScan() {
    const { centroidLng, centroidLat, zoom } = this.state.data;
    const center = [centroidLng, centroidLat];
    const m = map('map', config.WRLD3D_API_KEY, { center, zoom });

    m.on('initialstreamingcomplete', () => {
      buildings.buildingHighlight(
        buildings.buildingHighlightOptions()
        .highlightBuildingAtLocation(initCoord).informationOnly()
      )
      .addTo(m);

      this.setState({ map: m, lockFields: 'Done' });
    });

    m.buildings.on('buildinginformationreceived', this.handleInformation);
  }

  continueUpload() {
    const len = this.state.queue.length;

    if (len <= CITIES_PER_REQUEST) {
      if (len > 0) { this.props.newBuildings(this.state.queue); }

      this.setState({ buildings: {}, pointer: 0 });
    } else {
      this.props.newBuildings(this.state.queue.slice(0, CITIES_PER_REQUEST));
    }
  }

  handleInformation(e) {
    const buildingInformation = e.buildingHighlight.getBuildingInformation();
    const id = buildingInformation.getBuildingId();
    const builds = this.state.buildings;
    const percentDone = parseInt(n++ / totalCalls * 10000.0, 10) / 100.0;
    const { queue, pointer } = this.state;
    const bbox = this.state.bbox.map(el => (parseFloat(el)));
    const lowerLeftCorner = bbox.slice(0, 2);
    const upperRightCorner = bbox.slice(2);

    this.setState({ percentDone });

    if (id.length > 0 && !hasProp(builds, id)) {
      const dims = buildingInformation.getBuildingDimensions();
      const { lat, lng } = dims.getCentroid();
      const centroid = [lat, lng];
      const baseAltitude = dims.getBaseAltitude()[0];
      const topAltitude = dims.getTopAltitude()[0];

      builds[id] = true;

      queue.push({
        id,
        centroid,
        city: this.props.cities.latestCity,
        baseAltitude,
        topAltitude,
        name: id,
      });

      if (pointer + 1 === CITIES_PER_REQUEST) {
        const outQueue = queue.slice(0, CITIES_PER_REQUEST);

        this.setState({ pointer: -1 });

        this.props.newBuildings(outQueue);
      } else if (pointer !== -1) {
        this.setState({ queue, pointer: pointer + 1 });
      }
    }

    this.setState({ buildings: builds });

    initCoord[1] += STEP_SIZE;

    if (initCoord[1] - upperRightCorner[1] >= 0) {
      if (initCoord[0] - upperRightCorner[0] >= 0) {
        this.setState({
          percentDone: null,
          lockFields: 'Submit',
          buildings: {},
        });

        if (this.state.pointer > 0) {
          this.setState({ pointer: -2 });
          this.continueUpload();
        }

        return;
      }

      initCoord[1] = lowerLeftCorner[1];
      initCoord[0] += STEP_SIZE;
    }

    if (initCoord[0] >= 43.7049 &&
        Math.abs(initCoord[1] + 72.285) < STEP_SIZE) {
      initCoord[1] += STEP_SIZE;
    }

    buildings.buildingHighlight(
      buildings.buildingHighlightOptions()
      .highlightBuildingAtLocation(initCoord)
      .informationOnly()
    )
    .addTo(this.state.map);
  }

  handleSubmit(e) {
    e.preventDefault();

    const { name, centroidLng, centroidLat, bbox } = this.state.data;
    const data = { name, centroid: [centroidLng, centroidLat], bbox };

    this.props.addCity(data);

    this.setState({ lockFields: 'Loading...' });
  }

  updateMap(e) {
    if (e) { e.preventDefault(); }

    const { centroidLng, centroidLat, zoom } = this.state.data;

    this.state.map.setView([centroidLng, centroidLat], zoom);
  }

  render() {
    return (
      <div id="add-city" className={`${this.state.lockFields !== 'Submit' && this.state.map !== null ? 'loadingBuildings' : 'waiting'} ${this.props.toggled ? 'normal' : 'hidden'}`}>
        <form autoComplete="on" onSubmit={
          this.state.lockFields === 'Submit' ?
          this.handleSubmit :
          this.updateMap
        }>
          <input
            autoComplete="on"
            type="text"
            placeholder="* Name"
            value={this.state.data.name}
            disabled={this.state.lockFields !== 'Submit'}
            onChange={e => { this.onChange('name', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="* Centroid Longitude"
            min="-180"
            max="180"
            step="1e-6"
            disabled={this.state.lockFields !== 'Submit'}
            value={
              this.state.data.centroidLng === null ?
              '' :
              this.state.data.centroidLng
            }
            onChange={e => { this.onChange('centroidLng', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="* Centroid Latitude"
            min="-180"
            max="180"
            step="1e-6"
            disabled={this.state.lockFields !== 'Submit'}
            value={
              this.state.data.centroidLat === null ?
              '' :
              this.state.data.centroidLat
            }
            onChange={e => { this.onChange('centroidLat', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="* Zoom"
            min="0"
            step="1"
            disabled={this.state.lockFields !== 'Submit'}
            value={
              this.state.data.zoom === null ?
              '' :
              this.state.data.zoom
            }
            onChange={e => { this.onChange('zoom', e); }}
          />
          <div id="bbox">
            <input
              autoComplete="on"
              type="number"
              placeholder="* Min Lng"
              min="-180"
              max="180"
              step="1e-6"
              disabled={this.state.lockFields !== 'Submit'}
              value={
                this.state.data.bbox[0] === null ?
                '' :
                this.state.data.bbox[0]
              }
              onChange={e => {
                const bbox = this.state.data.bbox;
                bbox[0] = e.target.value;
                this.setState({ bbox, isComplete: isComplete(this.state.data) });
              }}
            />
            <input
              autoComplete="on"
              type="number"
              placeholder="* Min Lat"
              min="-180"
              max="180"
              step="1e-6"
              disabled={this.state.lockFields !== 'Submit'}
              value={
                this.state.data.bbox[1] === null ?
                '' :
                this.state.data.bbox[1]
              }
              onChange={e => {
                const bbox = this.state.data.bbox;
                bbox[1] = e.target.value;
                this.setState({ bbox, isComplete: isComplete(this.state.data) });
              }}
            />
            <input
              autoComplete="on"
              type="number"
              placeholder="* Max Lng"
              min="-180"
              max="180"
              step="1e-6"
              disabled={this.state.lockFields !== 'Submit'}
              value={
                this.state.data.bbox[2] === null ?
                '' :
                this.state.data.bbox[2]
              }
              onChange={e => {
                const bbox = this.state.data.bbox;
                bbox[2] = e.target.value;
                this.setState({ bbox, isComplete: isComplete(this.state.data) });
              }}
            />
            <input
              autoComplete="on"
              type="number"
              placeholder="* Max Lat"
              min="-180"
              max="180"
              disabled={this.state.lockFields !== 'Submit'}
              step="1e-6"
              value={
                this.state.data.bbox[3] === null ?
                '' :
                this.state.data.bbox[3]
              }
              onChange={e => {
                const bbox = this.state.data.bbox;
                bbox[3] = e.target.value;
                this.setState({ bbox, isComplete: isComplete(this.state.data) });
              }}
            />
          </div>
          <input
            type="submit"
            value={this.state.lockFields}
            disabled={
              !this.state.isComplete || this.state.lockFields !== 'Submit'
            }
          />
        </form>
        <h1 className={this.state.lockFields !== 'Submit' ? 'normal' : 'hidden'}>{
          this.state.percentDone === null ? '' : `Progress: ${this.state.percentDone}%`
        }</h1>
        <div
          id="map"
          className={this.state.lockFields !== 'Submit' && this.state.map !== null ? 'normal' : 'hidden'}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, { newBuildings, addCity })(AddCity);

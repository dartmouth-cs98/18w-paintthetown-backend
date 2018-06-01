import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map, buildings, polygon } from 'wrld.js';
import FileSaver from 'file-saver';
import * as topojson from 'topojson';

import { addCity, newBuildings } from '../actions';
import { hasProp } from '../../../../app/utils';
import {
  computeSurfaceArea,
  featurizeBuilding,
  reduceBuildingTopology,
} from '../../../../app/utils/geometry';
import { hslToRgb } from '../../../../app/utils/color';

const config = {
  WRLD3D_API_KEY: 'c0b58f7240bf36e09f110a3d41d3edee',
};

// const parseFloat(this.state.data.stepSize) = 1e-4;
const CITIES_PER_REQUEST = 50;
const QUANTIZE_AMOUNT = 1e6;

let initCoord = null;
let n = null;
let totalCalls = null;

function rainbowColor() {
  const i = parseInt(Math.round(n / totalCalls * 8), 10) % 8;

  return [...hslToRgb([i * 360.0 / 8.0, 1, 0.5]), 200];
}

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
        zoom: 15,
        bbox: [null, null, null, null],
        stepSize: null,
      },
      centroidLng: null,
      centroidLat: null,
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
    this.exportBuildings = this.exportBuildings.bind(this);
    this.computeCentroid = this.computeCentroid.bind(this);
    this.nextCoord = this.nextCoord.bind(this);
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
      initCoord = lowerLeftCorner.slice()
      .map(f => (Math.round(f * 1e6) / 1e6));

      totalCalls = (Math.ceil(
        Math.abs(lowerLeftCorner[0] - upperRightCorner[0]) / parseFloat(this.state.data.stepSize)
      )) * (Math.ceil(
        Math.abs(lowerLeftCorner[1] - upperRightCorner[1]) / parseFloat(this.state.data.stepSize))
      );
      // totalCalls = hanover.length;

      if (this.state.map === null) {
        this.startCityScan();
      } else {
        this.updateMap();

        buildings.buildingHighlight(
          buildings.buildingHighlightOptions()
          .highlightBuildingAtLocation(initCoord)
          .color(rainbowColor())
        )
        .addTo(this.state.map);

        this.setState({ lockFields: 'Done', buildings: {} });
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

    const complete = isComplete(data);
    const state = { data, isComplete: complete };

    if (complete) { this.computeCentroid(data); }

    this.setState(state);
  }

  startCityScan() {
    const { centroidLng, centroidLat, data } = this.state;
    const { zoom, bbox: [minLng, minLat, maxLng, maxLat] } = data;
    const center = [centroidLng, centroidLat];
    const m = map('map', config.WRLD3D_API_KEY, { center, zoom });

    m.on('initialstreamingcomplete', () => {
      this.setState({ map: m, lockFields: 'Done', buildings: {} });

      polygon([
        [minLng, minLat],
        [minLng, maxLat],
        [maxLng, maxLat],
        [maxLng, minLat],
      ]).addTo(m);

      this.nextCoord();

      if (initCoord !== null) {
        buildings.buildingHighlight(
          buildings.buildingHighlightOptions()
          .highlightBuildingAtLocation(initCoord)
          .color(rainbowColor())
        )
        .addTo(m);
      }
    });

    m.buildings.on('buildinginformationreceived', this.handleInformation);
  }

  continueUpload() {
    const len = this.state.queue.length;

    if (len <= CITIES_PER_REQUEST) {
      if (len > 0) {
        const queue = this.state.queue
        .map(id => (Object.assign({}, this.state.buildings[id], { id })));

        this.props.newBuildings(queue.map(({
          centroidLng,
          centroidLat,
          city,
          baseAltitude,
          topAltitude,
          contours: [contour, ...etc],
          name,
        }) => ({
          centroidLng,
          centroidLat,
          city,
          baseAltitude,
          topAltitude,
          surfaceArea: parseInt(Math.round(computeSurfaceArea(baseAltitude, topAltitude, contour)), 10),
          name,
          id: name,
        })));
      }

      this.setState({ pointer: 0 });
    } else {
      const queue = this.state.queue.slice(0, CITIES_PER_REQUEST)
      .map(id => (Object.assign({}, this.state.buildings[id], { id })));

      this.props.newBuildings(queue.map(({
        centroidLng,
        centroidLat,
        city,
        baseAltitude,
        topAltitude,
        contours: [contour, ...etc],
        name,
      }) => ({
        centroidLng,
        centroidLat,
        city,
        baseAltitude,
        topAltitude,
        surfaceArea: parseInt(Math.round(computeSurfaceArea(baseAltitude, topAltitude, contour)), 10),
        name,
        id: name,
      })));
    }
  }

  handleInformation(e) {
    const buildingInformation = e.buildingHighlight.getBuildingInformation();
    const id = buildingInformation.getBuildingId();
    const builds = this.state.buildings;
    const percentDone = parseInt(n++ / totalCalls * 10000.0, 10) / 100.0;
    const { queue, pointer } = this.state;

    this.setState({ percentDone });

    if (id.length > 0 && !hasProp(builds, id)) {
      const dims = buildingInformation.getBuildingDimensions();
      const { lat, lng } = dims.getCentroid();
      const centroid = [lat, lng];
      const baseAltitude = dims.getBaseAltitude()[0];
      const topAltitude = dims.getTopAltitude()[0];
      const contours = buildingInformation.getBuildingContours()
      .map(({ toJson }) => {
        const { points: p } = toJson();
        return p.map(({ lat: l, lng: g }) => ([l, g]));
      });

      builds[id] = {
        centroidLng: centroid[0],
        centroidLat: centroid[1],
        city: this.props.cities.latestCity,
        baseAltitude,
        topAltitude,
        contours,
        name: id,
      };

      queue.push(id);

      if (pointer + 1 === CITIES_PER_REQUEST) {
        const outQueue = queue.slice(0, CITIES_PER_REQUEST)
        .map(key => (Object.assign({}, builds[key], { id: key })));

        this.setState({ pointer: -1 });

        this.props.newBuildings(outQueue.map(({
          centroidLng,
          centroidLat,
          city,
          baseAltitude: bA,
          topAltitude: tA,
          contours: [contour, ...etc],
          name,
        }) => ({
          centroidLng,
          centroidLat,
          city,
          baseAltitude: bA,
          topAltitude: tA,
          surfaceArea: parseInt(Math.round(computeSurfaceArea(bA, tA, contour)), 10),
          name,
          id: name,
        })));
      } else if (pointer !== -1) {
        this.setState({ queue, pointer: pointer + 1 });
      }
    }

    this.setState({ buildings: builds });
    this.nextCoord(e);

    if (initCoord === null) {
      this.setState({
        percentDone: null,
        lockFields: 'Submit',
      });

      if (this.state.pointer > 0) {
        this.setState({ pointer: -2 });
        this.continueUpload();
      }

      return;
    }

    buildings.buildingHighlight(
      buildings.buildingHighlightOptions()
      .highlightBuildingAtLocation(initCoord)
      .color(rainbowColor())
    )
    .addTo(this.state.map);
  }

  handleSubmit(e) {
    e.preventDefault();

    const { centroidLng, centroidLat, data } = this.state;
    const { name, bbox } = data;
    const query = { name, centroid: [centroidLng, centroidLat], bbox };

    this.props.addCity(query);

    this.setState({ lockFields: 'Loading...' });
  }

  nextCoord() {
    const bbox = this.state.bbox.map(el => (parseFloat(el)));
    const lowerLeftCorner = bbox.slice(0, 2);
    const upperRightCorner = bbox.slice(2);

    initCoord[1] += parseFloat(this.state.data.stepSize);

    if (initCoord[1] - upperRightCorner[1] >= 0) {
      initCoord[1] = lowerLeftCorner[1];
      initCoord[0] += parseFloat(this.state.data.stepSize);

      if (initCoord[0] - upperRightCorner[0] >= 0) {
        initCoord = null;
        return;
      }
    }

    initCoord = initCoord.map(f => (Math.round(f * 1e6) / 1e6));
  }

  updateMap(e) {
    if (e) { e.preventDefault(); }

    const { data } = this.state;

    this.computeCentroid(data);
    this.state.map.setView([
      this.state.centroidLng,
      this.state.centroidLat,
    ], data.zoom);
  }

  exportBuildings(e) {
    e.preventDefault();

    const objects = Object.keys(this.state.buildings).map(id => {
      const obj = Object.assign({}, this.state.buildings[id], { id });

      delete obj.city;

      return obj;
    });

    const features = objects.map(featurizeBuilding)
    .reduce((arr, f) => ([f, ...arr]), []);
    const topology = topojson.topology(features, QUANTIZE_AMOUNT);
    const reduced = reduceBuildingTopology(topology);

    const buffer = JSON.stringify(reduced);
    const { data, centroidLng, centroidLat } = this.state;
    const { name, bbox } = data;
    const centroid = [centroidLng, centroidLat];
    const centroidStr = `${centroid.map(
      c => (parseInt(c * 1000.0, 10) / 1000.0)
    ).join(',')}`;
    const coords = bbox.map(c => (parseInt(c * 1000.0, 10) / 1000.0));
    const minCoord = `${coords[0]},${coords[1]}`;
    const maxCoord = `${coords[2]},${coords[3]}`;
    const fileName = `${name}_${centroidStr}_${minCoord}_${maxCoord}.json`;
    const file = new File([buffer], fileName, {
      type: 'application/javascript;charset=utf-8',
    });

    FileSaver.saveAs(file);
  }

  computeCentroid(data) {
    const [minLng, minLat, maxLng, maxLat] = data.bbox.map(s => (parseFloat(s)));

    this.setState({
      centroidLng: `${(maxLng + minLng) / 2.0}`,
      centroidLat: `${(maxLat + minLat) / 2.0}`,
    });
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
            placeholder="* Step size"
            min="0"
            step="1e-6"
            disabled={this.state.lockFields !== 'Submit'}
            value={
              this.state.data.stepSize === null ?
              '' :
              this.state.data.stepSize
            }
            onChange={e => { this.onChange('stepSize', e); }}
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

                const complete = isComplete(this.state.data);

                if (complete) { this.computeCentroid(this.state.data); }

                this.setState({ bbox, isComplete: complete });
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

                const complete = isComplete(this.state.data);

                if (complete) { this.computeCentroid(this.state.data); }

                this.setState({ bbox, isComplete: complete });
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

                const complete = isComplete(this.state.data);

                if (complete) { this.computeCentroid(this.state.data); }

                this.setState({ bbox, isComplete: complete });
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

                const complete = isComplete(this.state.data);

                if (complete) { this.computeCentroid(this.state.data); }

                this.setState({ bbox, isComplete: complete });
              }}
            />
          </div>
          <div id="buttons">
            <input
              type="submit"
              value={this.state.lockFields}
              disabled={
                !this.state.isComplete || this.state.lockFields !== 'Submit'
              }
            />
            <button
              disabled={Object.keys(this.state.buildings).length === 0 || this.state.percentDone !== null}
              onClick={this.exportBuildings}
            >Export</button>
          </div>
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

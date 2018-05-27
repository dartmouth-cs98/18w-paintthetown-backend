import * as topojson from 'topojson';

import Color from '../models/color_model';
import Team from '../models/team_model';
import City from '../models/city_model';
import Building from '../models/building_model';
import Challenge from '../models/challenge_model';

import { computeSurfaceArea, expandBuildingTopology } from './geometry';
import { addData } from './file';

export const LEVEL_REGEX = /^level([1-9]+)\.js$/;

function decode(objs) {
  const topology = expandBuildingTopology(objs);
  const features = Object.keys(topology.objects).map(k => (
    topojson.feature(topology, topology.objects[k])
  ));

  const buildings = features.map(({
    id,
    properties: { baseAltitude, topAltitude, centroidLng, centroidLat, name },
    geometry: { coordinates: [c] },
  }) => ({
    id,
    name,
    centroidLng,
    centroidLat,
    baseAltitude,
    topAltitude,
    contours: c.map(p => (p.slice(0, p.length - 1))),
  }));

  return buildings;
}

export const addChallenges = (filename, path) => {
  const level = LEVEL_REGEX.exec(filename)[1];

  return addData(`${path}/${filename}`, ({
    description,
    checkCompletion,
    reward,
  }) => {
    const challenge = new Challenge({
      checkCompletion,
      description,
      level,
      reward,
    });

    return challenge.save();
  }, challenges => {
    console.log(`\t•Added ${challenges.length} challenge${challenges.length === 1 ? '' : 's'} for level ${level}.`);
  });
};

export const addTeams = (filename, path) => (
  addData(`${path}/${filename}`, ({
    color,
    name,
    rgb,
    hex,
    type,
  }) => {
    const newColor = new Color({ name: color, rgb, hex });
    const team = new Team({ name, color: newColor._id, type });

    return newColor.save()
    .then(res => (team.save()));
  }, teams => {
    console.log(`\t•Added ${teams.length} color${teams.length === 1 ? '' : 's'}.`);
    console.log(`\t•Added ${teams.length} team${teams.length === 1 ? '' : 's'}.`);
  })
);

export const addCity = (filename, path) => {
  const [name, centroid, minCoord, maxCoord] = filename.split('_');
  const [centroidLng, centroidLat] = centroid.split(',').map(x => (
    parseFloat(x)
  ));
  const [minLng, minLat] = minCoord.split(',').map(x => (
    parseFloat(x)
  ));
  const [maxLng, maxLat] = maxCoord.split(',').map(x => (
    parseFloat(x)
  ));

  const city = new City({
    name,
    centroid: [centroidLng, centroidLat],
    bbox: [minLng, minLat, maxLng, maxLat],
  });

  return city.save()
  .then(result => {
    const { _id } = result._doc;

    return addData(`${path}/${filename}`, building => {
      const {
        topAltitude: tA,
        baseAltitude: bA,
        contours,
      } = building;
      const contour = contours[0];
      const surfaceArea = computeSurfaceArea(bA, tA, contour);

      const build = new Building({
        name: building.name,
        id: building.id,
        city: _id,
        centroidLng: building.centroidLng,
        centroidLat: building.centroidLat,
        baseAltitude: building.baseAltitude,
        topAltitude: building.topAltitude,
        surfaceArea: parseInt(Math.round(surfaceArea), 10),
      });

      return build.save();
    }, buildings => {
      console.log(`\t•Added ${buildings.length} building${buildings.length === 1 ? '' : 's'} to city ${name}.`);
    }, { decode });
  });
};

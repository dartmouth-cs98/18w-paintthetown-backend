import * as topojson from 'topojson';

import Color from './models/color_model';
import Team from './models/team_model';
import User from './models/user_model';
import City from './models/city_model';
import Building from './models/building_model';
import Challenge from './models/challenge_model';

import CHALLENGE_DATA from './data/challenges';

import { getFilesInPath, addData } from './utils/file';
import { computeSurfaceArea, expandBuildingTopology } from './utils/geometry';

import config from './config';

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

function addChallenges() {
  return new Promise((resolve, reject) => {
    const level1Challenges = [];
    const keys = Object.keys(CHALLENGE_DATA);
    const { length: n } = keys;
    const challenges = Object.keys(CHALLENGE_DATA).reduce((arr, level) => {
      CHALLENGE_DATA[level].forEach(({
        description,
        checkCompletion,
        reward,
      }) => {
        arr.push(new Challenge({
          level: /^level([1-9]+)$/.exec(level)[1],
          description,
          checkCompletion,
          reward,
        }));

        if (level === 'level1') {
          const { _id: challenge } = arr[arr.length - 1];
          level1Challenges.push(challenge);
        }
      });

      return arr;
    }, []);

    Promise.all(challenges.map(c => (c.save())))
    .then(res => {
      console.log(`\t•Added ${challenges.length} challenge${challenges.length === 1 ? '' : 's'} for ${n} level${n === 1 ? '' : 's'}.`);
      resolve(level1Challenges);
    })
    .catch(error => { reject(error); });
  });
}

function addTeams(filename) {
  return addData(`${__dirname}/data/teams/${filename}`, ({
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
  });
}

function addCity(filename) {
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

    return addData(`${__dirname}/data/cities/${filename}`, building => {
      const {
        topAltitude: tA,
        baseAltitude: bA,
        contours: [contour, ...etc],
      } = building;
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
}

export default (collections) => (new Promise((resolve, reject) => {
  const users = config.adminData.map((data) => (
    new User(Object.assign({}, data, { role: 'admin', typeOfLogin: 'email' })))
  );

  getFilesInPath(`${__dirname}/data/`)
  .then(dirs => (
    Promise.all(dirs.map(dir => (
      new Promise((resolve1, reject1) => {
        getFilesInPath(`${__dirname}/data/${dir}`)
        .then(jsonFiles => {
          if (dir === 'cities') {
            return Promise.all(jsonFiles.map(city => (addCity(city))))
            .then(res => { resolve1(res); })
            .catch(err => { reject1(err); });
          }

          if (dir === 'teams') {
            return addTeams(jsonFiles).then(res => { resolve1(res); })
            .catch(err => { reject1(err); });
          }

          if (dir === 'challenges') {
            return addChallenges()
            .then(challenges => {
              users.forEach(user => { Object.assign(user, { challenges }); });
              resolve1();
            })
            .catch(err => { reject1(err); });
          }

          return reject1(new EvalError(`unknown data type '${dir}'`));
        })
        .catch(error => { reject1(error); });
      })
    )))
  ))
  .then(res => (Promise.all(users.map(user => (user.save())))))
  .then(res => {
    console.log(`\t•Added ${res.length} user${res.length === 1 ? '' : 's'}.`);
    resolve();
  })
  .catch(error => { reject(error); });
}));

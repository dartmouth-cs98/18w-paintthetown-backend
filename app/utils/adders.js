import Color from '../models/color_model';
import User from '../models/user_model';
import Team from '../models/team_model';
import City from '../models/city_model';
import Building from '../models/building_model';
import Challenge from '../models/challenge_model';

import { computeSurfaceArea, decode } from './geometry';
import { addData, getFilesInPath } from './file';
import { hasProp, logger, generalLog } from './';
import config from '../config';

const { adminData: USERS } = config;
const LEVEL_REGEX = /^level([1-9]+)\.js$/i;
const Models = {
  Building,
  Challenge,
  City,
  Color,
  Team,
  User,
};

function resolveField(info, field, query) {
  return new Promise((resolve, reject) => {
    if (!hasProp(info, field) || !info[field]) {
      const update = {};

      Models[field].find(query, ['_id'])
      .then(data => {
        update[field] = data;

        Object.assign(info, update);

        resolve(info[field]);
      })
      .catch(error => { reject(error); });

      return;
    }

    resolve(info[field]);
  });
}

export const addChallenges = (path, info) => (
  getFilesInPath(path).then(levels => (
    Promise.all(levels.map(filename => {
      const level = LEVEL_REGEX.exec(filename)[1];

      return addData(`${path}/${filename}`, data => {
        const challenge = new Challenge(Object.assign({ level }, data));

        return challenge.save();
      }, challenges => {
        const msg = generalLog('Added', 'challenge', challenges, ` for level ${level}`);
        logger('DB_INIT_GROW', 'addChallenges', msg);
      });
    }))
  ))
  .then(() => (Challenge.find({ level: 1 }, ['_id'])))
);

export const addUsers = (path, info) => (
  Promise.all(USERS.map(user => (
    resolveField(info, 'Challenge', { level: 1 })
    .then(challenges => (
      new User(Object.assign({
        challenges,
        role: 'admin',
        typeOfLogin: 'email',
      }, user))
      .save()
    ))
  )))
  .then(() => {
    const msg = generalLog('Added', 'challenge', USERS);
    logger('DB_INIT_GROW', 'addUsers', msg);

    Promise.resolve();
  })
);

export const addTeams = (path, info) => (
  getFilesInPath(path)
  .then(files => (Promise.all(files.map(filename => (
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
      let msg = generalLog('Added', 'team', teams);
      logger('DB_INIT_GROW', 'addTeams', msg);

      msg = generalLog('Added', 'color', teams);
      logger('DB_INIT_GROW', 'addTeams', msg);
    })
  )))))
);

export const addCities = (path, info) => (
  getFilesInPath(path)
  .then(files => (Promise.all(files.map(filename => (
    new Promise((resolve, reject) => {
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

      city.save()
      .then(({ _doc: { _id } }) => {
        const response = {};

        response[filename] = _id;

        resolve(response);
      })
      .catch(error => { reject(error); });
    })
  )))))
  .then(cities => (new Promise(resolve => {
    const msg = generalLog('Added', 'city', cities);

    logger('DB_INIT_GROW', 'addTeams', msg);

    resolve(cities);
  })))
);

export const addBuildings = (path, info) => (
  getFilesInPath(path)
  .then(files => (Promise.all(files.map(filename => {
    const name = filename.split('_')[0];

    return resolveField(info, 'City', { name })
    .then(cityArr => {
      const [city] = cityArr;
      let _id = null;

      if (city instanceof Object && hasProp(city, filename)) {
        _id = city[filename];
      } else {
        _id = city._id;
      }

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
        const msg = generalLog('Added', 'building', buildings,
                               ` to city with ${_id}`);
        logger('DB_INIT_GROW', 'addBuildings', msg);
      }, { decode });
    });
  }))))
);

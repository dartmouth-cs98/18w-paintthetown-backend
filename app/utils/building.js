import mongoose from 'mongoose';

import Building from '../models/building_model.js';
import User from '../models/user_model.js';
import Team from '../models/team_model.js';

import { hasProp, hasProps } from '../utils';
import { hslToRgb, avgHslFromRgb, rgbToHsl, rgbToHex } from '../utils/color';

import config from '../config';

const { gameSettings, timers } = config;

export const getOwnedBuildings = () => (Building.find({ team: { $ne: null } }));

export const computeAvgSurfaceArea = (_id) => (
  new Promise((resolve, reject) => {
    Building.aggregate([{ $group: { _id, avg: { $avg: '$surfaceArea' } } }])
    .then(([{ avg }]) => { resolve(parseInt(Math.round(avg), 10)); })
    .catch(error => { reject(error); });
  })
);

export const newBuilding = (buildingData) => (
  new Promise((resolve, reject) => {
    const props = [
      'name',
      'centroidLng',
      'centroidLat',
      'baseAltitude',
      'topAltitude',
      'id',
      'city',
      'surfaceArea',
    ];

    if (!hasProps(buildingData, props)) {
      reject({
        message: `Buildings need ${props.map(p => (`'${p}'`)).slice(0, props.length - 1).join(', ')}, and \'${props[props.length - 1]}\' fields.`,
      });
    } else {
      const building = new Building();
      const id = buildingData.id;

      building.id = id;
      building.name = buildingData.name;
      building.centroidLng = buildingData.centroidLng;
      building.centroidLat = buildingData.centroidLat;
      building.baseAltitude = buildingData.baseAltitude;
      building.topAltitude = buildingData.topAltitude;
      building.surfaceArea = buildingData.surfaceArea;
      building.city = mongoose.Types.ObjectId(buildingData.city);

      if (hasProp(buildingData, 'description')) {
        building.description = buildingData.description;
      }

      if (hasProp(buildingData, 'tags')) { building.tags = buildingData.tags; }

      building.rgb = [0, 0, 0];
      building.hex = '#000000';

      building.save()
      .then(result => { resolve(); })
      .catch(error => { reject(error); });
    }
  })
);

export const restockPaint = (timer, id, avg) => {
  User.findById(id)
  .then(({ name, lastName, paintLeft: p }) => {
    if (p < gameSettings.paint.MAX_RESTOCK) {
      const paintLeft = Math.min(
        p + avg * gameSettings.paint.BUILDINGS_PER_RESTOCK,
        gameSettings.paint.MAX_RESTOCK,
      );

      User.update({ _id: id }, { paintLeft })
      .then(() => {
        console.log(`TIMER_TRG:\t Restocked ${name} ${lastName}'s paint supply: ${paintLeft}.`);

        timers.cancelConditional(
          id,
          `Stopped ${name} ${lastName}'s paint supply automatic restock.`,
          paintLeft,
          gameSettings.paint.MAX_RESTOCK,
        );
      });
    } else {
      timers.cancel(
        id,
        `Stopped ${name} ${lastName}'s paint supply automatic restock.`,
      );
    }
  })
  .catch(error => { console.log(error); });
};

export const computeColorsAndTeams = (teamID, building, saturation) => (
  new Promise((resolve, reject) => {
    Team.findById(teamID)
    .populate('color')
    .then(team => {
      let { teamStack } = building._doc;
      const { length: n } = teamStack;

      if (n === gameSettings.teams.MAX_TEAMS) {
        teamStack = [team, ...teamStack.slice(0, n - 1)];
      } else {
        teamStack = [team, ...teamStack];
      }

      const rgbVals = teamStack.map(t => (t.color.rgb));
      const avgHue = avgHslFromRgb(rgbVals.reverse())[0];
      const obj = {
        rgb: hslToRgb([avgHue, 1, 0.5]),
        teamStack: teamStack.map(t => (t._id)),
      };
      const [hue] = rgbToHsl(obj.rgb);
      let dist = Number.POSITIVE_INFINITY;
      let winningTeam = null;

      Team.find({})
      .populate('color')
      .then(allTeams => {
        for (let j = 0; j < allTeams.length; j += 1) {
          const { _doc: { color: { _doc: { rgb } } } } = allTeams[j];
          const [currHue] = rgbToHsl(rgb);
          const delta = Math.min(
            Math.abs(hue - currHue),
            Math.abs(Math.abs(hue - currHue) - 360),
          );

          if (delta < dist) {
            dist = delta;
            winningTeam = allTeams[j];
          }
        }

        obj.team = winningTeam;
        obj.hex = rgbToHex(obj.rgb);

        resolve(obj);
      })
      .catch(error => { reject(error); });
    })
    .catch(error => { reject(error); });
  })
);

export const fetchBuildings = (fields, search, query) => {
  let promise = null;

  if (hasProp(query, 'bbox')) {
    const { bbox } = query;
    const [minLng, minLat, maxLng, maxLat] = bbox;

    promise = Building.find(Object.assign({}, search, {
      centroidLng: { $gte: minLng, $lte: maxLng },
      centroidLat: { $gte: minLat, $lte: maxLat },
    }), fields);
  } else {
    const offset = hasProp(query, 'offset') ? parseInt(query.offset, 10) : 0;

    promise = Building.find(search, fields, {
      skip: offset,
      limit: offset + 5,
      sort: { name: 1 },
    });
  }

  if (fields.includes('team')) {
    return promise.populate({
      path: 'team',
      populate: {
        path: 'color',
        model: 'Color',
      },
    });
  }

  return promise;
};

export const paintBuilding = (building, user, team, saturation, id) => {
  const cities = user.citiesPainted.map(city => (`${city}`));
  const query = { _id: user._id };
  const update = {};

  if (user.paintLeft >= building.surfaceArea) {
    update.paintLeft = user.paintLeft - building.surfaceArea;
    update.buildingsPainted = user.buildingsPainted + 1;

    if (!cities.includes(`${building.city}`)) {
      update.citiesPainted = [building.city, ...user.citiesPainted];
    }
  }

  return User.update(query, update)
  .then(res => (
    new Promise(async (resolve, reject) => {
      const insufficientPaint = !hasProp(update, 'paintLeft');

      if (insufficientPaint) {
        resolve();
        return;
      }

      let rgb = null;
      let hex = null;
      let teamStack = null;
      let t = null;
      let error = null;

      if (update.paintLeft < gameSettings.paint.MAX_RESTOCK &&
          !timers.hasKey(user._id)) {
        ({
          rgb,
          hex,
          teamStack,
          team: t,
        } = await computeAvgSurfaceArea(building.city)
        .then(avg => {
          timers.addTimer(
            user._id,
            `Started automatic paint supply restock for ${user.name} ${user.lastName}.`,
            timer => { restockPaint(timer, user._id, avg); },
            gameSettings.paint.RESTOCK_INTERVAL,
            (timer, paintLeft, maxRefill) => (paintLeft >= maxRefill),
          );

          return computeColorsAndTeams(team, building, saturation);
        })
        .catch(e => { error = e; }));
      } else {
        ({
          rgb,
          hex,
          teamStack,
          team: t,
        } = await computeColorsAndTeams(team, building, saturation)
        .catch(e => { error = e; }));
      }

      if (error !== null) {
        reject(error);
        return;
      }

      Building.update({ id }, { teamStack, team: t, rgb, hex })
      .then(() => { resolve(); })
      .catch(e => { reject(e); });
    })
  ));
};

import mongoose from 'mongoose';

import Building from '../models/building_model.js';
import User from '../models/user_model.js';
import Team from '../models/team_model.js';

import { hasProp, hasProps } from '../utils';
import { avgHslFromRgb, rgbToHex, hexToRgb, rgbToHsl, hslToRgb } from '../utils/color';
import config from '../config';

const timers = {};

export const newBuildings = (req, res) => {
  if (!hasProp(req.body, 'buildings')) {
    res.json({ error: { errmsg: 'Array of buildings needed.' } });
  } else {
    const buildings = req.body.buildings;

    Promise.all(buildings.map(building => (newBuilding(building))))
    .then(() => {
      const message = `Added ${buildings.length} buildings.`;

      console.log(`POST:\t${message}`);

      res.json({ message });
    })
    .catch(error => { res.json({ error: { errmsg: error.message } }); });
  }
};

function newBuilding(buildingData) {
  return new Promise((resolve, reject) => {
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

      if (hasProp(buildingData, 'tags')) {
        building.tags = buildingData.tags;
      }

      if (hasProp(buildingData, 'city')) {

      }

      if (hasProp(buildingData, 'team')) {
        building.team = mongoose.Types.ObjectId(buildingData.team);
      }

      building.rgb = [0, 0, 0];
      building.hex = '#000000';

      building.save()
      .then(result => { resolve(); })
      .catch(error => { reject(error); });
    }
  });
}

function fetchBuildings(fields, search, query) {
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
}

function getOwnershipData(fields, ownershipActive) {
  return new Promise((resolve, reject) => {
    const teamActive = fields.includes('team');

    Team.find({}).populate('color')
    .then(teams => { resolve([teams, teamActive]); })
    .catch(error => { reject(error); });
  });
}

function computeOwnership(building, teams) {
  const ownership = {};
  let dist = Number.POSITIVE_INFINITY;
  let winningTeam = null;

  teams.forEach(team => { ownership[team.color.name] = 0; });

  if (building.team.length === 0) {
    return { ownership, team: null };
  }

  for (let j = 0; j < teams.length; j += 1) {
    const team = teams[j];
    const { color } = team._doc;
    const { name, rgb } = color._doc;
    const delta = Math.sqrt(rgb.reduce((d, v, i) => (
      d + (v - building.rgb[i]) ** 2
    ), 0));

    if (delta < dist) {
      dist = delta;
      winningTeam = team;
    }

    for (let i = 0; i < building.team.length; i += 1) {
      if (`${building.team[i]._id}` === `${team._id}`) { ownership[name] += 1; }
    }
  }

  return { ownership, team: winningTeam };
}

function processFields(
  building,
  teams,
  teamActive,
  ownershipActive,
  saturation,
) {
  const obj = Object.assign({}, building._doc);
  const keys = Object.keys(obj);
  const computeTeam = hasProp(building._doc, 'team') &&
                      building.team.length > 0 && teamActive;
  const hasRgb = hasProp(obj, 'rbg');
  const hasHex = hasProp(obj, 'hex');

  if (saturation !== null) {
    let rgb = hasProp(obj, 'rgb') ? obj.rgb : hexToRgb(obj.hex);
    const hsl = rgbToHsl(rgb);

    hsl[1] = saturation;

    rgb = hslToRgb(hsl);

    if (hasHex) { obj.hex = rgbToHex(rgb); }

    if (hasRgb) { obj.rgb = rgb; }
  }

  if (computeTeam || ownershipActive) {
    const { ownership, team } = computeOwnership(building, teams);

    if (ownershipActive) {
      keys.push('ownership');
      obj.ownership = ownership;
    }

    if (computeTeam) { obj.team = team; }
  }

  const finalObj = {};

  keys.sort()
  .forEach(key => {
    if (hasProp(obj, key)) {
      finalObj[key] = obj[key];
    } else {
      finalObj[key] = building[key];
    }
  });

  return finalObj;
}

function processBuildings(buildings, fields, ownershipActive, saturation) {
  return new Promise((resolve, reject) => {
    getOwnershipData(fields, ownershipActive)
    .then(([teams, teamActive]) => {
      resolve(buildings.map(building => (
        processFields(
          building,
          teams,
          teamActive,
          ownershipActive,
          saturation,
        )
      )));
    })
    .catch(error => { reject(error); });
  });
}

export const getBuildingIDs = (req, res) => {
  const fields = ['id'];
  const query = {};
  let ownershipActive = false;

  let saturation = null;

  if (hasProp(req.query, 'saturation') &&
      (fields.includes('hex') || fields.includes('rgb'))) {
    saturation = parseFloat(req.query.saturation);

    if (saturation < 0 || saturation > 1) {
      return res.json({
        error: {
          errmsg: 'saturation must a float between 0.0 and 1.0 (inclusive)',
        },
      });
    }
  }

  if (hasProp(req.query, 'extraFields')) {
    req.query.extraFields.forEach(field => {
      if (field === 'ownership') {
        ownershipActive = true;
      } else {
        fields.push(field);
      }
    });

    if (ownershipActive && !fields.includes('team')) { fields.push('team'); }
  }

  if (hasProp(req.query, 'teamOnly') && req.query.teamOnly === 'true') {
    query['team.0'] = { $exists: true };
  }

  return fetchBuildings(fields, query, req.query)
  .then(buildings => (
    processBuildings(buildings, fields, ownershipActive, saturation)
  ))
  .then(buildings => {
    console.log(`GET:\tSending ${buildings.length} building ID${buildings.length === 1 ? '' : 's'}.`);

    res.json({ buildings });
  })
  .catch(error => {
    console.log('ERROR: faulty query.');
    res.json({ error: { errmsg: error.message } });
  });
};

export const getInfo = (req, res) => {
  if (!hasProps(req.query, ['id', 'fields'])) {
    return res.json({
      error: { errmsg: 'getInfo needs a building \'id\' and \'fields\' field.' },
    });
  }

  const { fields } = req.query;
  const id = req.query.id;

  const ownershipActive = fields.includes('ownership');
  const computeTeam = fields.includes('team');
  const computeRgb = fields.includes('rgb');
  let saturation = null;

  if (hasProp(req.query, 'saturation') &&
      (fields.includes('hex') || computeRgb)) {
    saturation = parseFloat(req.query.saturation);

    if (saturation < 0 || saturation > 1) {
      return res.json({
        error: {
          errmsg: 'saturation must a float between 0.0 and 1.0 (inclusive)',
        },
      });
    }
  }

  if (ownershipActive && !computeTeam) { fields.push('team'); }
  if ((ownershipActive || computeTeam) && !computeRgb) {
    fields.push('rgb');
  }

  return Building.findOne({ id }, fields)
  .populate('team', 'color')
  .then(building => {
    Team.find({}).populate('color')
    .then(teams => {
      const finalObj = processFields(
        building,
        teams,
        computeTeam,
        ownershipActive,
        saturation,
      );

      console.log(`GET:\tSending data for building with id ${id}.`);
      res.json(finalObj);
    })
    .catch(error => {
      console.log('ERROR: faulty query.');
      res.json({ error: { errmsg: error.message } });
    });
  })
  .catch(error => {
    console.log('ERROR: faulty query.');
    res.json({ error: { errmsg: error.message } });
  });
};

function computeColorsAndTeams(teamID, building, saturation) {
  return new Promise((resolve, reject) => {
    Team.findById(teamID)
    .populate('color')
    .then(team => {
      let { team: teams } = building._doc;
      const { length: n } = teams;

      if (n === config.MAX_TEAMS) {
        teams = [team, ...teams.slice(0, n - 1)];
      } else {
        teams = [team, ...teams];
      }

      const rgbVals = teams.map(t => (t.color.rgb));
      const avgHue = avgHslFromRgb(rgbVals.reverse())[0];
      const obj = {
        rgb: hslToRgb([avgHue, 1, 0.5]),
        teams: teams.map(t => (t._id)),
      };

      obj.hex = rgbToHex(obj.rgb);

      resolve(obj);
    })
    .catch(error => { reject(error); });
  });
}

// GET request
export const getTeam = (req, res) => {
  if (!hasProps(req.query, ['id'])) {
    res.json({
      error: { errmsg: 'getTeam needs a building \'id\' field.' },
    });
  } else {
    Building.findById(req.query.id)
    .then(result => {
      console.log(`GET:\tSending building data for ${result.name} on team ${result.team}.`);
      res.json(result.team);
    })
    .catch(error => {
      console.log('ERROR:\tBuilding does not exist.');
      res.json({ error: { errmsg: error.message } });
    });
  }
};

function restockPaint(id, avg) {
  User.findById(id)
  .then(({ name, lastName, paintLeft: p }) => {
    if (p < config.MAX_RESTOCK) {
      const paintLeft = Math.min(
        p + avg * config.BUILDINGS_PER_RESTOCK,
        config.MAX_RESTOCK,
      );

      User.update({ _id: id }, { paintLeft })
      .then(() => {
        console.log(`TIMER_TRG:\t Restocked ${name} ${lastName}'s paint supply: ${paintLeft}.`);

        if (paintLeft === config.MAX_RESTOCK) {
          clearInterval(timers[id]);
          delete timers[id];
          console.log(`TIMER_CLR:\t Stopped ${name} ${lastName}'s paint supply automatic restock.`);
        }
      });
    } else {
      clearInterval(timers[id]);
      delete timers[id];
      console.log(`TIMER_CLR:\t Stopped ${name} ${lastName}'s paint supply automatic restock.`);
    }
  })
  .catch(error => { console.log(error); });
}

function computeAvgSurfaceArea(_id) {
  return new Promise((resolve, reject) => {
    Building.aggregate([{ $group: { _id, avg: { $avg: '$surfaceArea' } } }])
    .then(([{ avg }]) => { resolve(parseInt(Math.round(avg), 10)); })
    .catch(error => { reject(error); });
  });
}

// POST
// building has been painted/captured
// updateTeam and update current user's stats
export const updateTeam = (req, res) => {
  if (!hasProps(req.body, ['building', 'team'])) {
    return res.json({
      error: {
        errmsg: 'updateTeam needs \'building\' for building and \'team\' field.',
      },
    });
  }

  const team = mongoose.Types.ObjectId(req.body.team);
  const id = req.body.building;
  const user = req.user;
  let saturation = null;

  if (hasProp(req.body, 'saturation')) {
    saturation = parseInt(req.body.saturation, 10);

    if (saturation < 0 || saturation > 1) {
      return res.json({
        error: {
          errmsg: 'saturation must be within range 0.0-1.0.',
        },
      });
    }
  }

  return Building.findOne({ id })
  .populate({ path: 'team', populate: { path: 'color' } })
  .then(building => {
    const cities = user.citiesPainted.map(city => (`${city}`));
    const query = { _id: user._id };
    const update = { };

    if (user.paintLeft >= building.surfaceArea) {
      update.paintLeft = user.paintLeft - building.surfaceArea;
      update.buildingsPainted = user.buildingsPainted + 1;

      if (!cities.includes(`${building.city}`)) {
        update.citiesPainted = [building.city, ...user.citiesPainted];
      }
    }

    return User.update(query, update)
    .then(res => (
      new Promise((resolve, reject) => {
        const insufficientPaint = !hasProp(update, 'paintLeft');

        if (insufficientPaint) {
          resolve();
          return;
        }

        if (update.paintLeft < config.MAX_RESTOCK &&
            !hasProp(timers, user._id)) {
          computeAvgSurfaceArea(building.city)
          .then(avg => {
            timers[user._id] = setInterval(() => {
              restockPaint(user._id, avg);
            }, config.RESTOCK_INTERVAL);

            console.log(`TIMER_STRT:\tStarted automatic paint supply restock for ${user.name} ${user.lastName}.`);

            computeColorsAndTeams(team, building, saturation)
            .then(({ rgb, hex, teams }) => (
              Building.update({ id }, { team: teams, rgb, hex })
            ))
            .then(() => { resolve(); })
            .catch(error => { reject(error); });
          })
          .catch(error => { reject(error); });

          return;
        }

        computeColorsAndTeams(team, building, saturation)
        .then(({ rgb, hex, teams }) => (
          Building.update({ id }, { team: teams, rgb, hex })
        ))
        .then(() => { resolve(); })
        .catch(error => { reject(error); });
      })
    ));
  })
  .then(responses => (Building.findOne({ id })))
  .then(obj => {
    console.log(`POST:\t${user.name} ${user.lastName} from team ${team} painted (or attempted to paint) building ${id}.`);

    const building = Object.assign({}, obj._doc);

    if (saturation !== null) {
      const hsl = rgbToHsl(building.rgb);

      hsl[1] = saturation;

      building.rgb = hslToRgb(hsl);
      building.hex = rgbToHex(building.rgb);
    }

    res.json({ building, team });
  })
  .catch(error => {
    res.json({ error: { errmsg: error.message } });
  });
};

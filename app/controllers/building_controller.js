import mongoose from 'mongoose';

import Building from '../models/building_model.js';
import User from '../models/user_model.js';
import Team from '../models/team_model.js';

import { hasProp, hasProps, functionCalls, printStats, MAX_FN_CALLS } from '../utils';
import { rgbToHex, rgbToHsl, hslToRgb } from '../utils/color';
import {
  newBuilding,
  fetchBuildings,
  paintBuilding,
} from '../utils/building';
import config from '../config';

const { timers } = config;

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

export const getBuildingIDs = async (req, res) => {
  const fields = ['id'];
  const query = {};

  if (!hasProp(functionCalls, 'getBuildingIDs')) {
    functionCalls.getBuildingIDs = [];
  }

  functionCalls.getBuildingIDs
  .push({ start: Date.now() });

  let saturation = null;

  if (hasProp(req.query, 'saturation') &&
      (fields.includes('hex') || fields.includes('rgb'))) {
    saturation = parseFloat(req.query.saturation);

    if (saturation < 0 || saturation > 1) {
      res.json({
        error: {
          errmsg: 'saturation must a float between 0.0 and 1.0 (inclusive)',
        },
      });

      return;
    }
  }

  if (hasProp(req.query, 'extraFields')) {
    req.query.extraFields.forEach(field => { fields.push(field); });
  }

  if (hasProp(req.query, 'teamOnly') && req.query.teamOnly === 'true') {
    query.team = { $ne: null };
  }

  let buildings = null;
  let error = null;

  if (fields.includes('team')) {
    buildings = await fetchBuildings(fields, query, req.query)
    .populate('team')
    .catch(e => { error = e; });
  } else {
    buildings = await fetchBuildings(fields, query, req.query)
    .catch(e => { error = e; });
  }

  if (error !== null) {
    res.json({ error: { errmsg: error.message } });
    return;
  }

  console.log(`GET:\tSending ${buildings.length} building ID${buildings.length === 1 ? '' : 's'}.`);

  const { length: n } = functionCalls.getBuildingIDs;

  functionCalls.getBuildingIDs[n - 1].end = Date.now();

  if (functionCalls.getBuildingIDs.length === MAX_FN_CALLS) {
    printStats('getBuildingIDs', functionCalls.getBuildingIDs);
    functionCalls.getBuildingIDs = [];
  }

  res.json({ buildings });
};

export const getInfo = (req, res) => {
  if (!hasProps(req.query, ['id', 'fields'])) {
    return res.json({
      error: { errmsg: 'getInfo needs a building \'id\' and \'fields\' field.' },
    });
  }

  const { fields } = req.query;
  const id = req.query.id;

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

  return Building.findOne({ id }, fields)
  .then(({ _doc: b }) => {
    const obj = Object.assign({}, b);
    const { team = null } = obj;

    if (team !== null) {
      Team.findById(team)
      .populate('color')
      .then(t => {
        obj.team = t;

        console.log(`GET:\tSending data for building with id ${id}.`);
        res.json(obj);
      })
      .catch(error => { res.json({ error: { errmsg: error.message } }); });

      return;
    }

    console.log(`GET:\tSending data for building with id ${id}.`);
    res.json(obj);
  })
  .catch(error => {
    console.log('ERROR: faulty query.');
    res.json({ error: { errmsg: error.message } });
  });
};

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

// POST
// building has been painted/captured
// updateTeam and update current user's stats
export const updateTeam = (req, res) => {
  if (!hasProp(functionCalls, 'updateTeam')) {
    functionCalls.updateTeam = [];
  }

  functionCalls.updateTeam
  .push({ start: Date.now() });

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
  .populate({ path: 'teamStack', populate: { path: 'color' } })
  .then(building => (paintBuilding(building, user, team, saturation, id)))
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

    User.findById(user._id)
    .then(u => {
      const { _doc: { paintLeft, level } } = u;
      const timeLeft = timers.timeLeft(u._id);
      let timeLeftSec = null;
      let timeLeftMin = null;

      if (timeLeft !== null) {
        ({ secs: timeLeftSec, mins: timeLeftMin } = timeLeft);
      }

      const gameStatus = {
        building,
        team,
        user: { paintLeft, timeLeftMin, timeLeftSec, level },
        checkChallenges: true,
      };

      Object.assign(req, { user: u });

      const { length: n } = functionCalls.updateTeam;

      functionCalls.updateTeam[n - 1].end = Date.now();

      if (functionCalls.updateTeam.length === MAX_FN_CALLS) {
        printStats('updateTeam', functionCalls.updateTeam);
        functionCalls.updateTeam = [];
      }

      res.json(gameStatus);
    })
    .catch(error => { res.json({ error: { errmsg: error.message } }); });
  })
  .catch(error => { res.json({ error: { errmsg: error.message } }); });
};

import mongoose from 'mongoose';

import Building from '../models/building_model.js';
import User from '../models/user_model.js';
import Team from '../models/team_model.js';

import { hasProp, hasProps, generalLog } from '../utils';
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
      res.json({ message, _logMsg: message });
    })
    .catch(error => { res.json({ error: { errmsg: error.message } }); });
  }
};

export const getBuildingIDs = async (req, res) => {
  const fields = ['id'];
  const query = {};


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

  const _logMsg = generalLog('Sending', 'building ID', buildings);

  res.json({ buildings, _logMsg });
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
    const _logMsg = `Sending data for building with id ${id}.`;
    const obj = Object.assign({ _logMsg }, b);
    const { team = null } = obj;

    if (team !== null) {
      Team.findById(team)
      .populate('color')
      .then(t => {
        obj.team = t;

        res.json(obj);
      })
      .catch(error => { res.json({ error: { errmsg: error.message } }); });

      return;
    }

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
      const _logMsg = `Sending building data for ${result.name} on team ${result.team}.`;
      res.json(Object.assign({ _logMsg }, result.team));
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

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
  .populate({ path: 'teamStack', populate: { path: 'color' } })
  .then(building => (paintBuilding(building, user, team, saturation, id)))
  .then(responses => (Building.findOne({ id })))
  .then(obj => {
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

      const _logMsg = `${user.name} ${user.lastName} from team ${team} painted (or attempted to paint) building ${id}.`;

      const gameStatus = {
        building,
        team,
        user: { paintLeft, timeLeftMin, timeLeftSec, level },
        checkChallenges: true,
        _logMsg,
      };


      Object.assign(req, { user: u });

      res.json(gameStatus);
    })
    .catch(error => { res.json({ error: { errmsg: error.message } }); });
  })
  .catch(error => { res.json({ error: { errmsg: error.message } }); });
};

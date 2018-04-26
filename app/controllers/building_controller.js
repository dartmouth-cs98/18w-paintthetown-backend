import mongoose from 'mongoose';

import Building from '../models/building_model.js';
import User from '../models/user_model.js';
import Team from '../models/team_model.js';

import { hasProp, hasProps, rgbToHex, maxIndex } from '../utils';
import config from '../config';

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
    if (!hasProps(buildingData, [
      'name',
      'centroidLng',
      'centroidLat',
      'baseAltitude',
      'topAltitude',
      'id',
    ])) {
      reject({
        message: 'Building needs \'id\', \'name\', \'centroid\', \'baseAltitude\', and \'topAltitude\' fields.',
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

      if (hasProp(buildingData, 'description')) {
        building.description = buildingData.description;
      }

      if (hasProp(buildingData, 'tags')) {
        building.tags = buildingData.tags;
      }

      if (hasProp(buildingData, 'city')) {
        building.city = mongoose.Types.ObjectId(buildingData.city);
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
    .catch(error => { reject(error); });
  });
}

function computeOwnership(building, teams) {
  const colors = [];
  const ownership = {};

  teams.forEach(team => {
    colors.push(team.color.name);
    ownership[team.color.name] = 0;
  });

  if (building.team.length === 0) {
    return { ownership, team: null };
  }

  for (let i = 0; i < building.team.length; i += 1) {
    for (let j = 0; j < teams.length; j += 1) {
      const team = teams[j];

      if (`${building.team[i]._id}` === `${team._id}`) {
        const color = team.color.name;
        const update = {};

        ownership[color] += 1;
      }
    }
  }

  colors.forEach(color => {
    const k = ownership[color] / (building.team.length + 0.0);
    ownership[color] = k;
  });

  const vals = colors.map(k => (ownership[k]));
  const i = maxIndex(vals);

  return { ownership, team: teams[i] };
}

function processBuildings(buildings, fields, ownershipActive) {
  return new Promise((resolve, reject) => {
    getOwnershipData(fields, ownershipActive)
    .then(([teams, teamActive]) => {
      resolve(buildings.map(building => {
        const obj = Object.assign({}, building._doc);
        const keys = Object.keys(obj);
        const computeTeam = hasProp(building._doc, 'team') &&
                            building.team.length > 0 && teamActive;

        if (computeTeam || ownershipActive) {
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
      }));
    })
    .catch(error => { reject(error); });
  });
}

export const getBuildingIDs = (req, res) => {
  const fields = ['id'];
  const query = {};
  let ownershipActive = false;

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

  fetchBuildings(fields, query, req.query)
  .then(buildings => (processBuildings(buildings, fields, ownershipActive)))
  .then(buildings => {
    console.log(`GET:\tSending ${buildings.length} building ID${buildings.length === 1 ? '' : 's'}.`);

    res.json({ buildings });
  })
  .catch(error => {
    console.log('ERROR: faulty query.');
    res.json({ error: { errmsg: error.message } });
  });
};

export const getInfo = (req, res) => {
  if (!hasProps(req.query, ['id', 'fields'])) {
    res.json({
      error: { errmsg: 'getInfo needs a building \'id\' and \'fields\' field.' },
    });
  } else {
    const { fields } = req.query;
    const id = req.query.id;

    const ownershipActive = fields.includes('ownership');
    const computeTeam = fields.includes('team');

    if (ownershipActive && !computeTeam) { fields.push('team'); }

    Building.findOne({ id }, fields)
    .populate('team', 'color')
    .then(building => {
      const obj = Object.assign({}, building._doc);
      const keys = Object.keys(obj);

      console.log(`GET:\tSending data for building with id ${id}.`);

      if (computeTeam || ownershipActive) {
        Team.find({}).populate('color')
        .then(teams => {
          const { ownership, team } = computeOwnership(building, teams);

          if (ownershipActive) {
            keys.push('ownership');
            obj.ownership = ownership;
          }

          if (computeTeam) { obj.team = team; }

          const finalObj = {};

          keys.sort()
          .forEach(key => {
            if (hasProp(obj, key)) {
              finalObj[key] = obj[key];
            } else {
              finalObj[key] = building[key];
            }
          });

          res.json(finalObj);
        })
        .catch(error => {
          console.log('ERROR: faulty query.');
          res.json({ error: { errmsg: error.message } });
        });
      } else {
        const finalObj = {};

        keys.sort()
        .forEach(key => {
          if (hasProp(obj, key)) {
            finalObj[key] = obj[key];
          } else {
            finalObj[key] = building[key];
          }
        });

        res.json(finalObj);
      }
    })
    .catch(error => {
      console.log('ERROR: faulty query.');
      res.json({ error: { errmsg: error.message } });
    });
  }
};

function updateTeamsHelper(building, teamID) {
  return new Promise((resolve, reject) => {
    const n = building.team.length;
    let teams = building.team;

    if (n + 1 > config.maxTeams) {
      Team.findById(building.team[n - 1])
      .populate('color')
      .then(outTeam => {
        resolve({
          teams: [teamID].concat(teams.slice(0, n - 1)),
          outTeam,
        });
      })
      .catch(error => { reject(error); });
    } else {
      resolve({
        teams: [teamID].concat(teams),
        outTeam: null,
      });
    }
  });
}

function computeColorsAndTeams(teamID, building) {
  return new Promise((resolve, reject) => {
    console.log('teamID', teamID);
    Team.findById(teamID)
    .populate('color')
    .then(team => {
      console.log('team', team);

      const { rgb } = team.color._doc;
      let n = building.team.length + 0.0;
      const avg = building.rgb;

      const obj = {
        rgb: avg.map((val, i) => ((val * n + rgb[i]))),
      };

      updateTeamsHelper(building, teamID)
      .then(({ teams, outTeam }) => {
        if (outTeam !== null) {
          obj.rgb = obj.rgb.map((val, i) => (val - outTeam.color.rgb[i]));
        } else {
          n += 1;
        }

        console.log('outTeam', team);

        obj.rgb = obj.rgb.map((val, i) => (val / n));
        obj.hex = rgbToHex({ r: obj.rgb[0], g: obj.rgb[1], b: obj.rgb[2] });
        obj.teams = teams;

        // console.log(n, avg, obj.rgb);

        resolve(obj);
      })
      .catch(error => { reject(error); });
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
      console.log('ERROR: building does not exist.');
      res.json({ error: { errmsg: error.message } });
    });
  }
};

// POST
// building has been painted/captured
// updateTeam and update current user's stats
export const updateTeam = (req, res) => {
  if (!hasProps(req.body, ['building', 'team'])) {
    res.json({
      error: {
        errmsg: 'updateTeam needs \'building\' for building and \'team\' field.',
      },
    });
  } else {
    const team = mongoose.Types.ObjectId(req.body.team);
    const id = req.body.building;
    const user = req.user;

    Building.findOne({ id })
    .then(building => {
      const cities = user.citiesPainted.map(city => (`${city}`));
      const query = { _id: user._id };
      const update = { buildingsPainted: user.buildingsPainted + 1 };

      if (!cities.includes(`${building.city}`)) {
        update.citiesPainted = [building.city].concat(user.citiesPainted);
      }

      return User.update(query, update)
      .then(res => (
        computeColorsAndTeams(team, building)
        .then(({ rgb, hex, teams }) => (
          Building.update({ id }, { team: teams, rgb, hex })
        ))
      ));
    })
    .then(responses => (Building.findOne({ id })))
    .then(building => {
      console.log(`POST:\tUpdated building to team with id ${team} and updated buildingsPainted and citiesPainted for user ${user._id}`);
      res.json({ building, team });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

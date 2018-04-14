import mongoose from 'mongoose';

import Building from '../models/building_model.js';
import User from '../models/user_model.js';

import { hasProp, hasProps } from '../utils';

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

  for (let i = 0; i < fields.length; i += 1) {
    if (fields[i] === 'team') {
      return promise.populate({
        path: 'team',
        populate: {
          path: 'color',
          model: 'Color',
        },
      });
    }
  }

  return promise;
}

export const getBuildingIDs = (req, res) => {
  const fields = ['id'];
  const query = {};

  if (hasProp(req.query, 'extraFields')) {
    req.query.extraFields.forEach(field => { fields.push(field); });
  }

  if (hasProp(req.query, 'teamOnly') && req.query.teamOnly === 'true') {
    query.team = { $ne: null };
  }

  fetchBuildings(fields, query, req.query)
  .then(buildings => {
    console.log(`GET:\tSending ${buildings.length} building ID${buildings.length === 1 ? '' : 's'}.`);

    res.json({ buildings: buildings.map(building => {
      if (building.team !== null) {
        for (let i = 0; i < fields.length; i += 1) {
          if (fields[i] === 'team') {
            return Object.assign({}, building._doc, {
              team: building.team.color.name,
            });
          }
        }

        return building;
      }

      return building;
    }) });
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

    Building.findOne({ id }, fields)
    .then(result => {
      res.json(result);
      console.log(`GET:\tSending data for building with id ${id}.`);
    })
    .catch(error => {
      console.log('ERROR: faulty query.');
      res.json({ error: { errmsg: error.message } });
    });
  }
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

    Promise.all([
      Building.update({ id }, { team }),
      Building.findOne({ id })
      .then(building => {
        const cities = user.citiesPainted.map(city => (`${city}`));
        const query = { _id: user._id };
        const update = { buildingsPainted: user.buildingsPainted + 1 };

        if (!cities.includes(`${building.city}`)) {
          update.citiesPainted = user.citiesPainted.concat([building.city]);
        }

        return User.update(query, update);
      }),
    ])
    .then(responses => {
      console.log(`POST:\tUpdated building to team with id ${team} and updated buildingsPainted and citiesPainted for user ${user._id}`);
      res.json({ building: req.body.building, team });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

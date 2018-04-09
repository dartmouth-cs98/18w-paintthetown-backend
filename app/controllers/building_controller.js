import mongoose from 'mongoose';

import Building from '../models/building_model.js';
import Team from '../models/team_model.js';

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
    if (!hasProps(buildingData, ['name', 'centroid', 'baseAltitude', 'topAltitude', 'id'])) {
      reject({
        message: 'Building needs \'id\', \'name\', \'centroid\', \'baseAltitude\', and \'topAltitude\' fields.',
      });
    } else {
      const building = new Building();
      const id = buildingData.id;

      building.id = id;
      building.name = buildingData.name;
      building.centroidLng = buildingData.centroid[0];
      building.centroidLat = buildingData.centroid[1];
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

      building.save()
      .then(result => { resolve(); })
      .catch(error => { reject(error); });
    }
  });
}

export const getBuildingIDs = (req, res) => {
  if (hasProp(req.query, 'bbox')) {
    const { bbox } = req.query;
    const [minLng, minLat, maxLng, maxLat] = bbox;

    Building.find({
      centroidLng: { $gte: minLng, $lte: maxLng },
      centroidLat: { $gte: minLat, $lte: maxLat },
    }, ['id'])
    .then(buildings => {
      console.log(`GET:\tSending ${buildings.length} building ID${buildings.length === 1 ? '' : 's'}.`);
      res.json({ buildings });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  } else {
    const offset = hasProp(req.query, 'offset') ? parseInt(req.query.offset, 10) : 0;

    Building.find({}, ['id'], {
      skip: offset,
      limit: offset + 5,
      sort: { name: 1 },
    })
    .then(buildings => {
      console.log(`GET:\tSending ${buildings.length} building ID${buildings.length === 1 ? '' : 's'}.`);
      res.json({ buildings });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
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

// // GET request
// export const getBuilding = (req, res) => {
//   if (!hasProps(req.query, ['id'])) {
//     res.json({
//       error: 'getBuilding needs a building \'id\' field.',
//     });
//   } else {
//     Building.findOne({id:req.query.id})
//     .then(result => {
//       res.json(result.team)
//       console.log(`GET:\tSending building data for ${building.name} on team ${building.team}.`);
//     })
//     .catch(error => {
//       console.log('ERROR: building does not exist.');
//       res.json({ error: error.message });
//     });
//     }
// };

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

    Team.findById(team)
    .then(result => (
      Building.update({ id }, { team })
    ))
    .then(({ nModified }) => {
      console.log(`POST:\tUpdated ${nModified} building${nModified === 1 ? '' : 's'} to team with id ${team}.`);
      res.json({ building: req.body.building, team });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

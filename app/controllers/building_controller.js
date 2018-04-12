import mongoose from 'mongoose';

import Building from '../models/building_model.js';
import Team from '../models/team_model.js';
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

      if (hasProp(buildingData, 'team')) {
        building.team = mongoose.Types.ObjectId(buildingData.team);
      }


      // Team.find({})
      // .then(teams => {
      //   if (parseInt(Math.round(Math.random() + 1), 10) % 2 === 0) {
      //     building.team = teams[0]._id;
      //   }

      building.save()
      .then(result => { resolve(); })
      .catch(error => { reject(error); });
      // })
      // .catch(error => { reject(error); });
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
    // .then(buildings => {
    //   console.log(`GET:\tSending ${buildings.length} building ID${buildings.length === 1 ? '' : 's'} within bbox ${bbox}.`);
    // })
    // .catch(error => {
    //   res.json({ error: { errmsg: error.message } });
    // });
  } else {
    const offset = hasProp(query, 'offset') ? parseInt(query.offset, 10) : 0;

    promise = Building.find(search, fields, {
      skip: offset,
      limit: offset + 5,
      sort: { name: 1 },
    });
    // .then(buildings => {
    //   console.log(`GET:\tSending ${buildings.length} building ID${buildings.length === 1 ? '' : 's'}.`);
    //   res.json({ buildings });
    // })
    // .catch(error => {
    //   res.json({ error: { errmsg: error.message } });
    // });
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

  if (hasProp(req.query, 'teamOnly') && req.query.teamOnly) {
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

    const user = req.body.user;

    Promise.all([
      Building.update({ id }, { team }),
      Building.findById(id)
      .then( building => {
        var building = Building.findById(id);
        if (inArray(building.city, user.citiesPainted) != -1) {
          var citiesPainted = user.citiesPainted;
          citiesPainted.push(building.city);
          return User.update({id: user._id}, {buildingsPainted: User.buildingsPainted +1, citiesPainted: citiesPainted});
        }
        else{
          return User.update({id: user._id}, {buildingsPainted: User.buildingsPainted +1});
        }
      })
   ])
   .then(responses => {
     console.log(`POST:\tUpdated building to team with id ${team} and updated user buildingsPainted and citiesPainted for user ${user._id}`);
     res.json({ building: req.body.building, team });
   })
   .catch(error => {
     res.json({ error: { errmsg: error.message } });
   });
  }
};

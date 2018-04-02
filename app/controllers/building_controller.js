import mongoose from 'mongoose';

import Building from '../models/building_model.js';
import Team from '../models/team_model.js';

import { hasProp, hasProps } from '../utils';


export const newBuilding = (req, res) => {
  if (!hasProps(req.body, ['name', 'centroid', 'baseAltitude', 'topAltitude', 'id'])) {
    res.json({
      error: {
        errmsg: 'Building needs \'id\', \'name\', \'centroid\', \'baseAltitude\', and \'topAltitude\' fields.',
      },
    });
  } else {
    const building = new Building();
    const id = req.body.id;

    building.id = id;
    building.name = req.body.name;
    building.centroid = req.body.centroid;
    building.baseAltitude = req.body.baseAltitude;
    building.topAltitude = req.body.topAltitude;

    if (hasProp(req.body, 'description')) {
      building.description = req.body.description;
    }

    if (hasProp(req.body, 'tags')) {
      building.tags = req.body.tags;
    }

    if (hasProp(req.body, 'city')) {
      building.city = req.body.city;
    }

    building.save()
    .then(result => {
      console.log(`POST:\tAdded building ${building.name}.`);

      res.json({ id });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

export const getBuildingIDs = (req, res) => {
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

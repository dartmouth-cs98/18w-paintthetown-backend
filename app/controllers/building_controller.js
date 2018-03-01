import Building from '../models/building_model.js';

import { hasProps } from '../utils';


export const newBuilding = (req, res) => {
  if (!hasProps(req.body, ['name', 'centroid', 'baseAltitude', 'topAltitude'])) {
    res.json({
      error: 'Building needs \'name\', \'centroid\', \'baseAltitude\', and \'topAltitude\' fields.',
    });
  } else {
    const building = new Building();

    building.name=req.body.name;
    building.centroid=req.body.centroid;
    building.baseAltitude = req.body.baseAltitude;
    building.topAltitude = req.body.topAltitude;

    if (hasProp(req.body, 'description')) {
      building.description=req.body.description;
    }
    if (hasProp(req.body, 'tags')) {
      building.tags=req.body.tags;
    }
    if (hasProp(req.body,'city')) {
      building.city=req.body.city;
    }
    if (hasProp(req.body, 'polyhedron')) {
      building.polyhedron=req.body.polyhedron;
    }

    building.save()
    .then(result => {
      console.log(`POST:\tAdded building ${building.name}.`);

      res.json({ id: result._id });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

export const getLocationInfo = (req, res) => {
  if (!hasProps(req.params, ['id'])) {
    res.json({
      error: 'getLocationInfo needs a building \'id\' field.',
    });
  } else {
    Building.findById(req.query.id)
    .then(result => {
      res.json(centroid:result.centroid);
      console.log(`GET:\tSending location data for ${building.name}.`);
    })
    .catch(error => {
      console.log('ERROR: building does not exist.');
      res.json({ error: error.message });
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
      error: 'getTeam needs a building \'id\' field.',
    });
  } else {
    Building.findById(req.query.id)
    .then(result => {
      res.json(result.team)
      console.log(`GET:\tSending building data for ${building.name} on team ${building.team}.`);
    })
    .catch(error => {
      console.log('ERROR: building does not exist.');
      res.json({ error: error.message });
    });
    }
};

// POST
export const updateTeam = (req, res) => {
  if (!hasProp(req.body, ['building_id','team_id'])) {
    res.json({
      error: 'updateTeam needs \'building_id\' for building and \'team_id\' field.',
    });
  } else {
    Team.findById(req.body.team_id)
    .then(result => (
      Building.update({ _id: req.body.building_id }, { team: req.body.team_id })
    ))
    .then(result => {
      console.log(`POST:\tUpdated building ${building.id} to team with id ${team}.`);
      res.json({ building: _id, team });
    })
    .catch(error =>
      res.json({ error: error.message })
    );
  }
};

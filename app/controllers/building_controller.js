import Building from '../models/building_model.js';

import { hasProps } from '../utils';


export const newBuilding = (req, res) => {
  if (!hasProps(req.body, ['name', 'centroid', 'polyhedron', 'baseAltitude', 'topAltitude'])) {
    res.json({
      error: 'Building needs \'name\', \'centroid\', \'baseAltitude\', \'topAltitude\', and \'polyhedron\' fields.',
    });
  } else {
    const building = new Building();

    building.name=req.body.name;
    building.centroid=req.body.centroid;
    building.baseAltitude = req.body.baseAltitude;
    building.topAltitude = req.body.topAltitude;
    building.polyhedron=req.body.polyhedron;

    if (hasProp(req.body, 'description')) {
      building.description=req.body.description;
    }
    if (hasProp(req.body, 'tags')) {
      building.tags=req.body.tags;
    }
    if (hasProp(req.body,'city')) {
      building.city=req.body.city;
    }

    building.save()
    .then(result => {
      console.log(`POST:\tAdded building ${building.name} in the city of ${building.city}.`);

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
    User.find({ team: req.params.id })
    .then(userCount => {
      return User.count({ team: req.params.id }).exec();
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

// GET request
export const getTeam = (req, res) => {
  if (!hasProps(req.params, ['id'])) {
    res.json({
      error: 'getTeam needs a building \'id\' field.',
    });
  } else {
    const building = req.building;
    res.json(building.team)
    console.log(`GET:\tSending building data for ${building.name} on team ${buidling.team}.`);
  }
};

// PUT
export const changeTeam = (req, res) => {
  if (!hasProp(req.body, ['building_id','team_id'])) {
    res.json({
      error: 'changeTeam needs \'building_id\' for building and \'team_id\' field.',
    });
  } else {
    const building = req.building;
    const _id = building.id;
    const team = req.body.team;

    Building.update({ _id }, { team })
    .then(result => {
      console.log(`PUT:\tChanged building ${building.id} to team with id ${team}.`);
      res.json({ building: _id, team });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

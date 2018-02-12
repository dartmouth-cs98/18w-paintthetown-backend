import Building from '../models/building_model.js';

import { hasProps } from '../utils';


export const newBuilding = (req, res) => {
  if (!hasProps(req.body, ['name', 'centroid', 'polyhedron', 'city'])) {
    res.json({
      error: 'Building needs \'name\', \'centroid\',  \'polyhedron\', and \'city\' fields.',
    });
  } else {
    const building = new Building();

    building.name=req.body.name;
    building.centroid=req.body.centroid;
    building.polyhedron=req.body.polyhedron;
    building.city=req.body.city;

    if (hasProp(req.body, 'description')){
      building.description=req.body.description;
    }
    if (hasProp(req.body, 'tags')){
      building.tags=req.body.tags;
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

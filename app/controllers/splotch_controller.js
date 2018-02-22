import Splotch from '../models/splotch_model.js';

import { checkBuildingFace } from '../utils';


export const newSplotch = (req, res) => {
  if (!hasProps(req.body, ['centroid','buildingFace'])) {
    res.json({
      error: 'Splotches need \'centroid\' and \'buildingFace\' fields.',
    });
  } else {
    const splotch = new Splotch();

    splotch.centroid = req.body.centroid;
    splotch.buildingFace = req.body.buildingFace;


    splotch.save()
    .then(result => {
      console.log(`POST:\tAdded splotch on ${splotch.buildingFace} side of the building.`);

      res.json({ id: result._id });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

// // GET request
// export const getSplotches = (req, res) => {
//
//
//
//
//
//
// };

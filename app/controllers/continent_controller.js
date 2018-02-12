import Continent from '../models/continent_model.js';

import { hasProps } from '../utils';

export const newContinent = (req, res) => {
  if (!hasProps(req.body, ['name','centroid'])) {
    res.json({
      error: 'Continent needs \'name\' and \'centroid\' fields.',
    });
  } else {
    const continent = new Continent();

    continent.name=req.body.name;
    continent.centroid=req.body.centroid;

    continent.save()
    .then(result => {
      console.log(`POST:\tAdded continent ${continent.name}.`);

      res.json({ id: result._id });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

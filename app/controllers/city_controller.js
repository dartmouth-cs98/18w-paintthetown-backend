import City from '../models/city_model.js';

import { hasProps } from '../utils';

export const newCity = (req, res) => {
  if (!hasProps(req.body, ['name','country','centroid'])) {
    res.json({
      error: 'City needs \'name\', \'country\', and \'centroid\' fields.',
    });
  } else {
    const city = new City();

    city.name=req.body.name;
    city.country=req.body.country;
    city.centroid=req.body.centroid;

    city.save()
    .then(result => {
      console.log(`POST:\tAdded city ${city.name} in the country of ${city.country}.`);

      res.json({ id: result._id });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

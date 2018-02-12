import country from '../models/country_model.js';

import { hasProps } from '../utils';

export const newCountry = (req, res) => {
  if (!hasProps(req.body, ['name', 'continent', 'centroid'])) {
    res.json({
      error: 'Country needs \'name\', \'continent\', and \'centroid\' fields.',
    });
  } else {
    const country = new Country();

    country.name=req.body.name;
    country.continent=req.body.continent;
    country.centroid=req.body.centroid;

    country.save()
    .then(result => {
      console.log(`POST:\tAdded country ${country.name}.`);

      res.json({ id: result._id });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

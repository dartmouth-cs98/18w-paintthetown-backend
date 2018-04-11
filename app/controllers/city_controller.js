import City from '../models/city_model.js';

import { hasProps } from '../utils';

export const newCity = (req, res) => {
  if (!hasProps(req.body, ['name', 'bbox', 'centroid'])) {
    res.json({ error: {
      errmsg: 'City needs \'name\', \'country\', and \'centroid\' fields.',
    } });
  } else {
    const city = new City();

    city.name = req.body.name;
    city.bbox = req.body.bbox;
    city.centroid = req.body.centroid;

    city.save()
    .then(result => {
      console.log(`POST:\tAdded city ${city.name}.`);

      res.json({ id: result._id });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

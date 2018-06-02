import City from '../models/city_model.js';

import { hasProps, generalLog } from '../utils';

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
      const _logMsg = `Added city ${city.name}.`;

      res.json({ id: result._id, _logMsg });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

export const getData = (req, res) => {
  if (!hasProps(req.query, ['cities', 'fields'])) {
    res.json({
      error: { errmsg: 'getCityNames needs \'cities\' and \'fields\' keys.' },
    });
  } else {
    const { cities: c, fields } = req.query;

    Promise.all(c.map(id => (City.findById(id, fields))))
    .then(cities => {
      const _logMsg = generalLog('Sending', 'city', cities);

      res.json({ cities, _logMsg });
    })
    .catch(error => { res.json({ error: { errmsg: error.message } }); });
  }
};

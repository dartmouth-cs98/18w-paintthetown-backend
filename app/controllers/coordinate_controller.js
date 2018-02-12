import Coordinate from '../models/coordinate_model.js';

import { hasProps } from '../utils';

export const newCoordinate = (req, res) => {
  if (!hasProps(req.body, ['value'])) {
    res.json({
      error: 'Coordinate needs a \'value\'  field.',
    });
  } else {
    const coordinate = new Coordinate();

    coordinate.value=req.body.value;

    coordinate.save()
    .then(result => {
      console.log(`POST:\tAdded coordinate ${coordinate.value}.`);

      res.json({ id: result._id });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

import Color from '../models/color_model.js';

import { hasProps } from '../utils';


export const newColor = (req, res) => {
  if (!hasProps(req.body, ['hex', 'rgb', 'name'])) {
    res.json({
      error: 'Colors need \'name\', \'hex\', and \'rgb\' fields.',
    });
  } else {
    const color = new Color();

    color.hex = req.body.hex;
    color.rgb = req.body.rgb;
    color.name = req.body.name;

    color.save()
    .then(result => {
      console.log(`POST:\tAdded color ${color.name}.`);

      res.json({ id: result._id });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

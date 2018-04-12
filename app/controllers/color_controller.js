import { Types } from 'mongoose';

import Color from '../models/color_model.js';

import { hasProps, hasProp } from '../utils';


export const newColor = (req, res) => {
  if (!hasProps(req.body, ['name', 'hex', 'rgb'])) {
    res.json({
      error: { errmsg: 'Colors need \'name\', \'hex\', and \'rgb\' fields.' },
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
      res.json({ error: { errmsg: error.message } });
    });
  }
};

export const getColorIDs = (req, res) => {
  const offset = hasProp(req.query, 'offset') ? parseInt(req.query.offset, 10) : 0;

  Color.find({}, ['_id'], {
    skip: offset,
    limit: offset + 5,
    sort: { name: 1 },
  })
  .then(colors => {
    console.log(`GET:\tSending ${colors.length} color ID${colors.length === 1 ? '' : 's'}.`);
    res.json({ colors });
  })
  .catch(error => {
    res.json({ error: { errmsg: error.message } });
  });
};

// GET request
export const getColorData = (req, res) => {
  if (!hasProps(req.query, ['id'])) {
    res.json({
      error: { errmsg: 'Color query needs a color \'id\' field.' },
    });
  } else {
    const { id } = req.query;

    Color.findById(Types.ObjectId(id))
    .then(result => {
      console.log(`GET:\tRetrieved data for color ${result.name} with id ${id}.`);

      res.json(result);
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

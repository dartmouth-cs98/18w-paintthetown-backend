import { Types } from 'mongoose';

import Color from '../models/color_model.js';

import { hasProps, hasProp, generalLog } from '../utils';


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
      const _logMsg = `Added color ${color.name}.`;

      res.json({ id: result._id, _logMsg });
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
    const _logMsg = generalLog('Sending', 'color ID', colors);

    res.json({ colors, _logMsg });
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
      const _logMsg = `tRetrieved data for color ${result.name} with id ${id}.`;

      res.json(Object.assign({ _logMsg }, result));
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

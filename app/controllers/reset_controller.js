import Building from '../models/building_model.js';
import City from '../models/city_model.js';
import Color from '../models/color_model.js';
import Continent from '../models/continent_model.js';
import Coordinate from '../models/coordinate_model.js';
import Country from '../models/country_model.js';
import Pattern from '../models/pattern_model.js';
import Splotch from '../models/splotch_model.js';
import Tag from '../models/tag_model.js';
import Team from '../models/team_model.js';
import User from '../models/user_model.js';

import { hasProps } from '../utils';
import initScript from '../init_script';

const MODELS = {
  Building,
  City,
  Color,
  Continent,
  Coordinate,
  Country,
  Pattern,
  Splotch,
  Tag,
  Team,
  User,
};

export const resetDB = (req, res) => {
  let collections = null;

  if (!hasProps(req.body, ['collections'])) {
    collections = Object.keys(MODELS);
  } else {
    collections = req.body.collections;
  }

  if (!hasProps(MODELS, collections)) {
    res.json({
      error: { errmsg: 'One or more unknown collections found.' },
    });
  } else {
    let message = null;

    Promise.all(collections.map(collection => (
      MODELS[collection].remove({})
    )))
    .then(responses => {
      let total = 0;

      responses.forEach(({ result }) => {
        const { n } = result;
        total += n;
      });

      message = `Successfully removed ${total} items from ${collections.length} collection${collections.length > 1 ? 's' : ''}.`;
      console.log(`POST: ${message}`);

      return initScript(collections);
    })
    .then(() => { res.json({ message }); })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

import Building from '../models/building_model.js';
import Challenge from '../models/challenge_model';
import City from '../models/city_model.js';
import Color from '../models/color_model.js';
import Particle from '../models/particle_model.js';
import Team from '../models/team_model.js';
import User from '../models/user_model.js';

import { hasProp, contains } from '../utils';
import { sortModels } from '../utils/misc';
import initScript from '../init_script';

const Models = {
  Building,
  Challenge,
  City,
  Color,
  Particle,
  Team,
  User,
};

export const resetDB = (req, res) => {
  const { collections: c = null } = req.body;
  const unknown = [];
  let collections = c.reduce((arr, coll) => {
    if (hasProp(Models, coll)) { return [...arr, coll]; }

    unknown.push(coll);

    return arr;
  }, []);

  if (unknown.length > 0) {
    res.json({
      error: {
        errmsg: `One or more unknown collections found: ${unknown.join(', ')}.`,
      },
    });
    return;
  }

  if (collections.length === 0) {
    collections = Object.keys(Models);
  } else {
    const hasCity = contains(collections, 'City');

    if (contains(collections, 'Team')) { collections.push('Color'); }
    if ((contains(collections, 'Challenge') || hasCity) &&
        !contains(collections, 'User')) {
      collections.push('User');
    }
    if (hasCity && !contains(collections, 'Building')) {
      collections.push('Building');
    }
  }

  const keys = collections.sort(sortModels);

  let tot = null;

  console.log(`POST:\tStarted reset procedure for ${collections.length} collection${collections.length === 1 ? '' : 's'}.`);

  Promise.all(keys.map(collection => (Models[collection].remove({}))))
  .then(responses => {
    tot = responses.reduce((t, { result: { n } }) => (t + n), 0);

    return initScript(keys);
  })
  .then(() => {
    console.log(`DB_INIT_END:\tRemoved items: ${tot}. Total collections: ${collections.length}.`);

    res.json({ message: 'Successful reset.' });
  })
  .catch(error => {
    res.json({ error: { errmsg: error.message } });
  });
};

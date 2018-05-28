import Building from '../models/building_model.js';
import Challenge from '../models/challenge_model';
import City from '../models/city_model.js';
import Color from '../models/color_model.js';
import Particle from '../models/particle_model.js';
import Team from '../models/team_model.js';
import User from '../models/user_model.js';

import { hasProp } from '../utils';
import initScript from '../init_script';

const MODELS = {
  Building,
  Challenge,
  City,
  Color,
  Particle,
  Team,
  User,
};

function includeDependencies(arr) {
  const newArr = [];
  let hasTeams = false;
  let hasColors = false;
  let hasChallenges = false;
  let hasCity = false;

  arr.forEach(model => {
    switch (model) {
      case 'Color':
        hasColors = true;
        break;
      case 'Team':
        if (!hasColors) {
          newArr.push('Color');
          hasColors = true;
        }

        hasTeams = true;
        break;
      case 'Building':
        if (!hasCity) {
          newArr.push('City');
          hasCity = true;
        }
        break;
      case 'City':
        hasCity = true;
        break;
      case 'User':
        if (!hasColors) {
          newArr.push('Color');
          hasColors = true;
        }

        if (!hasTeams) {
          newArr.push('Team');
          hasTeams = true;
        }
        if (!hasChallenges) {
          newArr.push('Challenge');
          hasChallenges = true;
        }
        break;
      default: break;
    }

    newArr.push(model);
  });

  return newArr;
}

function sortModels(a, b) {
  if (a === b) { return 0; }

  switch (a) {
    case 'Color': case 'Challenge': return -1;
    case 'Team': return -1 + (b === 'Color') * 2;
    case 'City': return 1 - (b === 'Building') * 2;
    default:
      if (a === 'City' && b === 'Building') {
        return -1;
      }

      return 1;
  }
}

export const resetDB = (req, res) => {
  const { collections: c = null } = req.body;
  const unknown = [];
  let collections = c.reduce((obj, coll) => {
    const update = {};

    if (hasProp(MODELS, coll)) {
      update[coll] = MODELS[coll];
    } else {
      unknown.push(coll);
    }

    return Object.assign(obj, update);
  }, {});

  if (unknown.length > 0) {
    res.json({
      error: {
        errmsg: `One or more unknown collections found: ${unknown.join(', ')}.`,
      },
    });
    return;
  }

  if (Object.keys(collections).length === 0) {
    collections = Object.assign({}, MODELS);
  }

  const keys = Object.keys(collections).sort(sortModels);

  console.log(includeDependencies(keys));

  let message = null;

  Promise.all(collections.map(collection => (MODELS[collection].remove({}))))
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
  .then(() => {
    res.json({ message });
  })
  .catch(error => {
    res.json({ error: { errmsg: error.message } });
  });
};

import { Router } from 'express';

import {
  requireAuth,
  requireSignin,
  requireAdminAuth,
} from './services/passport';
import { routerPassthrough } from './utils/router';
import { jsonQuickSort } from './utils';

import * as Users from './controllers/user_controller';
import * as Colors from './controllers/color_controller';
import * as Teams from './controllers/team_controller';
import * as Patterns from './controllers/pattern_controller';
import * as Particles from './controllers/particle_controller';
import * as Buildings from './controllers/building_controller';
import * as Cities from './controllers/city_controller';
import * as Continents from './controllers/continent_controller';
import * as Countries from './controllers/country_controller';
import * as Tags from './controllers/tag_controller';
import * as Challenges from './controllers/challenge_controller';
import * as Reset from './controllers/reset_controller';

import Challenge from './models/challenge_model';

const router = Router();

router.route('/reset')
      .post(requireAdminAuth, Reset.resetDB);

router.route('/users')
      .get(requireAuth, Users.getUserData)
      .post(requireAuth, Users.addUserToTeam);

router.route('/users/updateInfo')
      .post(requireAuth, Users.updateUserData);

router.route('/users/friends')
      .post(requireAuth, Users.addFriend);

router.route('/colors')
      .get(requireAuth, Colors.getColorData)
      .post(requireAuth, Colors.newColor);

router.route('/colors/ids')
      .get(requireAuth, Colors.getColorIDs);

router.route('/teams')
      .get(requireAuth, Teams.getTeamIDs)
      .post(requireAuth, Teams.createTeam);

router.route('/teams/info')
      .get(requireAuth, Teams.getInfo);

router.route('/patterns')
      .post(requireAuth, Patterns.newPattern);

router.route('/buildings')
      .get(requireAuth, Buildings.getBuildingIDs)
      .post(requireAuth, Buildings.newBuildings);

router.route('/buildings/info')
      .get(requireAuth, Buildings.getInfo);

router.route('/buildings/getTeam')
      .get(requireAuth, Buildings.getTeam);

router.route('/buildings/updateTeam')
      .post(requireAuth, Buildings.updateTeam);

router.route('/particles')
      .get(requireAuth, Particles.getParticles)
      .post(requireAuth, Particles.addParticles);

router.route('/cities')
      .get(requireAuth, Cities.getData)
      .post(requireAuth, Cities.newCity);

router.route('/continents')
      .post(requireAuth, Continents.newContinent);

router.route('/countries')
      .post(requireAuth, Countries.newCountry);

router.route('/tags')
      .post(requireAuth, Tags.newTag);

router.post('/signin', requireSignin, Users.signIn);

router.post('/signup', Users.signUp);

function solveLogic(user, q) {
  const [type, op, ...rest] = q;

  if (rest.length < 2) { return false; }

  const [var1, val1, ...etc] = rest;
  let bool = null;

  switch (op) {
    case 2: bool = user[var1] > val1; break;
    case 1: bool = user[var1] >= val1; break;
    case -1: bool = user[var1] <= val1; break;
    case -2: bool = user[var1] < val1; break;
    default: bool = user[var1] === val1;
  }

  if (etc.length > 0) {
    if (type === 'OR') { return bool || solveLogic(etc); }

    return bool && solveLogic(etc);
  }

  return bool;
}

const r = routerPassthrough(router, (req, res, json) => {
  const { checkChallenges = false, challenges } = json;

  if (checkChallenges) {
    const { user } = req;
    const obj = Object.assign({}, json);

    delete obj.checkChallenges;

    const completed = challenges.reduce((arr, { _doc: challenge = null }) => {
      if (challenge === null) { return arr; }

      const { checkCompletion: trigger = null, _id = null } = challenge;

      if (trigger !== null && solveLogic(user, trigger)) { arr.push(_id); }

      return arr;
    }, []);

    if (completed.length > 0) {
      Object.assign(req, { body: { challenges: completed } });

      new Promise((resolve) => {
        Challenges.toggleChallenges(req, { json: resolve });
      })
      .then(({ challenges: c = null, error = null, user: u = null }) => {
        if (c === null) {
          if (error === null) {
            res.json({ error: { errmsg: `unknown error occurred updating ${user.name} ${user.lastName}'s challenges` } });
          } else {
            res.json({ error });
          }
        } else {
          const $nin = c.map(ch => (ch._id));

          Challenge.find({ level: u.level, _id: { $nin } })
          .then(arr => {
            obj.challenges = [
              ...c.map(ch => ({
                description: ch.description,
                completed: true,
              })),
              ...arr.map(ch => ({
                description: ch.description,
                completed: false,
              })),
            ];
            res.json(jsonQuickSort(obj));
          })
          .catch(err => { res.json({ error: { errmsg: err.message } }); });
        }
      })
      .catch(error => { res.json({ error: { errmsg: error.message } }); });
      return;
    }

    Challenge.find({ level: user.level, _id: { $nin: user.challenges } })
    .then(arr => {
      obj.challenges = [
        ...arr.map(ch => ({
          description: ch.description,
          completed: true,
        })),
        ...user.challenges.map(ch => ({
          description: ch.description,
          completed: false,
        })),
      ];
      res.json(jsonQuickSort(obj));
    })
    .catch(err => { res.json({ error: { errmsg: err.message } }); });
  }

  res.json(jsonQuickSort(json));
});

export default r;

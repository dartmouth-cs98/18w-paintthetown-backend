import { Router } from 'express';

import {
  requireAuth,
  requireSignin,
  requireAdminAuth,
} from './services/passport';

import { logger } from './utils';
import { routerPassthrough, logSortRoutes } from './utils/misc';
import { appendChallenges } from './utils/challenge';

import config from './config';

import * as Users from './controllers/user_controller';
import * as Colors from './controllers/color_controller';
import * as Teams from './controllers/team_controller';
import * as Particles from './controllers/particle_controller';
import * as Buildings from './controllers/building_controller';
import * as Cities from './controllers/city_controller';
import * as Reset from './controllers/reset_controller';

let r = Router();
const { gameSettings: { trackRunnningTime: TRACK } } = config;

r.route('/reset')
 .post(requireAdminAuth, Reset.resetDB);

r.route('/users')
 .get(requireAuth, Users.getUserData)
 .post(requireAuth, Users.addUserToTeam);

r.route('/users/updateInfo')
 .post(requireAuth, Users.updateUserData);

r.route('/users/friends')
 .post(requireAuth, Users.addFriend);

r.route('/colors')
 .get(requireAuth, Colors.getColorData)
 .post(requireAuth, Colors.newColor);

r.route('/colors/ids')
 .get(requireAuth, Colors.getColorIDs);

r.route('/teams')
 .get(requireAuth, Teams.getTeamIDs)
 .post(requireAuth, Teams.createTeam);

r.route('/teams/info')
 .get(requireAuth, Teams.getInfo);

r.route('/buildings')
 .get(requireAuth, Buildings.getBuildingIDs)
 .post(requireAuth, Buildings.newBuildings);

r.route('/buildings/info')
 .get(requireAuth, Buildings.getInfo);

r.route('/buildings/getTeam')
 .get(requireAuth, Buildings.getTeam);

r.route('/buildings/updateTeam')
 .post(requireAuth, Buildings.updateTeam);

r.route('/particles')
 .get(requireAuth, Particles.getParticles)
 .post(requireAuth, Particles.addParticles);

r.route('/cities')
 .get(requireAuth, Cities.getData)
 .post(requireAuth, Cities.newCity);

r.post('/signin', requireSignin, Users.signIn);

r.post('/signup', Users.signUp);

r = routerPassthrough(r, appendChallenges, 'after');
r = routerPassthrough(r, logSortRoutes, 'after');

if (Object.keys(TRACK).length > 0) {
  r = routerPassthrough(
    r,
    (req, res, json, fnName) => {
      if (TRACK[fnName]) {
        logger(`REQ_END_${req.init_time}: ${req.ip}`, fnName, `${Date.now()}.`);
      }

      res.json(json);
    },
    'after',
  );

  r = routerPassthrough(
    r,
    (req, res, json, fnName) => {
      Object.assign(req, { init_time: Date.now() });

      if (TRACK[fnName]) {
        logger(`REQ_STRT: ${req.ip}`, fnName, `${Date.now()}.`);
      }

      res.json(json);
    },
    'before',
  );
}

const router = r;

export default router;

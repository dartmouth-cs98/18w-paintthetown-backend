import { Router } from 'express';

import {
  requireAuth,
  requireSignin,
  requireAdminAuth,
} from './services/passport';
import { routerPassthrough, appendChallenges } from './utils/misc';

import * as Users from './controllers/user_controller';
import * as Colors from './controllers/color_controller';
import * as Teams from './controllers/team_controller';
import * as Particles from './controllers/particle_controller';
import * as Buildings from './controllers/building_controller';
import * as Cities from './controllers/city_controller';
// import * as Challenges from './controllers/challenge_controller';
import * as Reset from './controllers/reset_controller';

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

router.post('/signin', requireSignin, Users.signIn);

router.post('/signup', Users.signUp);

const r = routerPassthrough(router, appendChallenges);

export default r;

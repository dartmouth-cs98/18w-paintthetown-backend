import { Router } from 'express';

import {
  requireAuth,
  requireSignin,
  requireAuthFacebook,
  requireAdminAuth,
} from './services/passport';

import * as Users from './controllers/user_controller';
import * as Colors from './controllers/color_controller';
import * as Teams from './controllers/team_controller';
import * as Patterns from './controllers/pattern_controller';
import * as Splotches from './controllers/splotch_controller';
import * as Buildings from './controllers/building_controller';
import * as Cities from './controllers/city_controller';
import * as Continents from './controllers/continent_controller';
import * as Coordinates from './controllers/coordinate_controller';
import * as Countries from './controllers/country_controller';
import * as Tags from './controllers/tag_controller';
import * as Reset from './controllers/reset_controller';

const router = Router();

router.route('/reset')
      .post(requireAdminAuth, Reset.resetDB);

router.route('/users')
      .get(requireAuth, Users.getUserData)
      .put(requireAuth, Users.addUserToTeam);

router.route('/users/friends')
      .post(requireAuth, Users.addFriend);

router.route('/colors')
      .get(requireAuth, Colors.getColorData)
      .post(requireAuth, Colors.newColor);

router.route('/teams')
      .post(requireAuth, Teams.createTeam);

router.route('/teams/countUsers')
      .get(requireAuth, Teams.countUsers);

router.route('/patterns')
      .post(requireAuth, Patterns.newPattern);

router.route('/splotches')
      .post(requireAuth, Splotches.newSplotch);

router.route('/buildings')
      .get(requireAuth, Buildings.getBuildingIDs)
      .post(requireAuth, Buildings.newBuilding);

router.route('/buildings/info')
      .get(requireAuth, Buildings.getInfo);

router.route('/buildings/getTeam')
      .get(requireAuth, Buildings.getTeam);

router.route('/buildings/updateTeam')
      .post(requireAuth, Buildings.updateTeam);

router.route('/cities')
      .post(requireAuth, Cities.newCity);

router.route('/coordinates')
      .post(requireAuth, Coordinates.newCoordinate);

router.route('/continents')
      .post(requireAuth, Continents.newContinent);

router.route('/countries')
      .post(requireAuth, Countries.newCountry);

router.route('/tags')
      .post(requireAuth, Tags.newTag);

router.post('/signin', requireSignin, Users.signIn);

router.post('/signup', Users.signUp);

// facebook
// router.get('/auth/facebook', requireLoginFacebook);
router.get('/facebook/tokenize', (req, res, next) => {
  requireAuthFacebook(req, res, next, Users.signIn);
});

export default router;

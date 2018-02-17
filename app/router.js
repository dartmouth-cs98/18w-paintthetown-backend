import { Router } from 'express';

import { requireAuth, requireSignin, requireAuthFacebook, verifiedFacebook } from './services/passport';
import * as Users from './controllers/user_controller';
import * as Colors from './controllers/color_controller';
import * as Teams from './controllers/team_controller';
import * as Buildings from './controllers/building_controller';
import * as Cities from './controllers/city_controller';
import * as Continents from './controllers/continent_controller';
import * as Coordinates from './controllers/coordinate_controller';
import * as Countries from './controllers/country_controller';
import * as Tags from './controllers/tag_controller';

const router = Router();

router.route('/users')
      .get(requireAuth, Users.getUserData)
      .put(requireAuth, Users.addUserToTeam);

router.route('/users/friends')
      .post(requireAuth, Users.addFriend);

router.route('/colors')
      .post(requireAuth, Colors.newColor);
router.route('/teams')
      .post(requireAuth, Teams.createTeam);
router.route('/buildings')
      .post(requireAuth, Buildings.newBuilding);
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
router.get('/auth/facebook', requireAuthFacebook);
router.get('/auth/facebook/callback', (req, res, next) => {
  verifiedFacebook(req, res, next, Users.facebookCallback);
});

export default router;

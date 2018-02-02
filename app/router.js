import { Router } from 'express';

import { requireAuth } from './services/passport';
import * as Users from './controllers/user_controller';
import * as Colors from './controllers/color_controller';
import * as Teams from './controllers/team_controller';


const router = Router();

router.route('/users')
      .get(requireAuth, Users.getUserData)
      .put(requireAuth, Users.addUserToTeam);

router.route('/users/friends')
      .post(requireAuth, Users.addFriend);

router.route('/colors')
      .post(Colors.newColor);

router.route('/teams')
      .post(Teams.createTeam);

// router.post('/signin', requireSignin, Users.signin);
router.post('/signup', Users.signUp);

export default router;

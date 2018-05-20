import { combineReducers } from 'redux';

import auth from './auth-reducer';
import users from './users-reducer';
import colors from './colors-reducer';
import buildings from './buildings-reducer';
import teams from './teams-reducer';
import cities from './cities-reducer';
import particles from './particles-reducer';
import reset from './reset-reducer';

const rootReducer = combineReducers({
  auth,
  users,
  colors,
  buildings,
  teams,
  particles,
  cities,
  reset,
});

export default rootReducer;

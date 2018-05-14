import { combineReducers } from 'redux';

import AuthReducer from './auth-reducer';
import UsersReducer from './users-reducer';
import ColorsReducer from './colors-reducer';
import BuildingsReducer from './buildings-reducer';
import TeamsReducer from './teams-reducer';
import CitiesReducer from './cities-reducer';
import ParticlesReducer from './particles-reducer';
import ResetReducer from './reset-reducer';

const rootReducer = combineReducers({
  auth: AuthReducer,
  users: UsersReducer,
  colors: ColorsReducer,
  buildings: BuildingsReducer,
  teams: TeamsReducer,
  particles: ParticlesReducer,
  cities: CitiesReducer,
  reset: ResetReducer,
});

export default rootReducer;

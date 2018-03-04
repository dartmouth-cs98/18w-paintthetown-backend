import { combineReducers } from 'redux';

import AuthReducer from './auth-reducer';
import UsersReducer from './users-reducer';
import ColorsReducer from './colors-reducer';
import BuildingsReducer from './buildings-reducer';

const rootReducer = combineReducers({
  auth: AuthReducer,
  users: UsersReducer,
  colors: ColorsReducer,
  buildings: BuildingsReducer,
});

export default rootReducer;

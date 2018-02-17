import { combineReducers } from 'redux';

import AuthReducer from './auth-reducer';
import UsersReducer from './users-reducer';

const rootReducer = combineReducers({
  auth: AuthReducer,
  users: UsersReducer,
});

export default rootReducer;

import { ActionTypes } from '../actions';

const defaultAuth = {
  authenticated: false,
  error: null,
};

function AuthReducer(state = defaultAuth, action) {
  switch (action.type) {
    case ActionTypes.AUTH_USER:
      return Object.assign({}, state, {
        authenticated: true,
      });

    case ActionTypes.DEAUTH_USER:
      return Object.assign({}, state, {
        authenticated: false,
      });

    case ActionTypes.ERROR:
      console.log(action.message);
      return Object.assign({}, state, {
        authenticated: false,
        error: action.message,
      });

    case ActionTypes.CLEAR_ERR:
      return Object.assign({}, state, {
        error: null,
      });

    default:
      return state;
  }
}

export default AuthReducer;

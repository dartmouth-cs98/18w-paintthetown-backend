import { ActionTypes } from '../actions';

const defaultUsers = {
  data: null,
  tokenizedFacebookCode: null,
  error: null,
};

function UsersReducer(state = defaultUsers, action) {
  switch (action.type) {
    case ActionTypes.GET_USER_DATA:
      return Object.assign({ }, state, { data: action.data });

    case ActionTypes.TOKENIZE_FACEBOOK_CODE:
      return Object.assign({ }, state, { tokenizedFacebookCode: action.token });

    case ActionTypes.USER_ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    case ActionTypes.CLEAR_USER_ERROR:
      return Object.assign({}, state, { error: null });

    default: return state;
  }
}

export default UsersReducer;

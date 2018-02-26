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

    case ActionTypes.ERROR:
      console.log(action.message);
      return Object.assign({}, state, {
        error: action.message,
      });

    default:
      return state;
  }
}

export default UsersReducer;

import { ActionTypes } from '../actions';

const defaultUsers = {
  data: null,
  error: null,
};

function UsersReducer(state = defaultUsers, action) {
  switch (action.type) {
    case ActionTypes.GET_USER_DATA:
      return Object.assign({ }, state, { data: action.data });

    case ActionTypes.AUTH_ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    default:
      return state;
  }
}

export default UsersReducer;

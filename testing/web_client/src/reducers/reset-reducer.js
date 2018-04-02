import { ActionTypes } from '../actions';

const defaultReset = {
  message: null,
  error: null,
};

function UsersReducer(state = defaultReset, action) {
  switch (action.type) {
    case ActionTypes.RESET:
      return Object.assign({ }, state, { message: action.message });

    case ActionTypes.RESET_ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    default:
      return state;
  }
}

export default UsersReducer;

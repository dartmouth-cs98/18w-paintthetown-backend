import { ActionTypes } from '../actions';

const defaultColors = {
  latestID: null,
  buildings: [],
};

function UsersReducer(state = defaultColors, action) {
  switch (action.type) {
    case ActionTypes.NEW_BUILDING:
      return Object.assign({ }, state, { latestID: action.id });

    case ActionTypes.ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    default:
      return state;
  }
}

export default UsersReducer;

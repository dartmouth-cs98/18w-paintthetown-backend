import { ActionTypes } from '../actions';

const defaultColors = {
  latestID: null,
  fontColor: '#ffffff',
  error: null,
};

function UsersReducer(state = defaultColors, action) {
  switch (action.type) {
    case ActionTypes.NEW_COLOR:
      return Object.assign({ }, state, { latestID: action.id });

    case ActionTypes.GET_COLOR_DATA:
      return Object.assign({ }, state, { fontColor: action.hex });

    case ActionTypes.COLOR_ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    case ActionTypes.CLEAR_COLOR_ERROR:
      return Object.assign({}, state, { error: null });

    default:
      return state;
  }
}

export default UsersReducer;

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
      console.log(action.hex);
      return Object.assign({ }, state, { fontColor: action.hex });

    case ActionTypes.ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    default:
      return state;
  }
}

export default UsersReducer;

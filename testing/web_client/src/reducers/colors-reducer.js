import { ActionTypes } from '../actions';

const defaultColors = {
  latestColor: {
    id: null,
    name: null,
  },
  latestID: null,
  colors: null,
  fontColor: '#ffffff',
  error: null,
};

function UsersReducer(state = defaultColors, action) {
  switch (action.type) {
    case ActionTypes.NEW_COLOR:
      return Object.assign({ }, state, { latestID: action.id });

    case ActionTypes.GET_COLOR_DATA:
      return Object.assign({ }, state, { latestColor: action.latestColor });

    case ActionTypes.GET_COLOR_IDS:
      return Object.assign({ }, state, {
        colors: action.colors.map(({ _id }) => (_id)),
      });

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

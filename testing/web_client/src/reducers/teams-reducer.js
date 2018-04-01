import { ActionTypes } from '../actions';

const defaultTeams = {
  teams: null,
};

function TeamsReducer(state = defaultTeams, action) {
  switch (action.type) {
    case ActionTypes.GET_TEAM_IDS:
      console.log(action.teams);
      return Object.assign({ }, state, {
        teams: action.teams.map(({ _id }) => (_id)),
      });

    case ActionTypes.TEAM_ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    case ActionTypes.CLEAR_TEAM_ERROR:
      return Object.assign({}, state, { error: null });

    default:
      return state;
  }
}

export default TeamsReducer;

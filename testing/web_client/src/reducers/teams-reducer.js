import { ActionTypes } from '../actions';

const defaultTeams = {
  teams: null,
  latestTeam: {
    id: null,
    info: null,
  },
};

function TeamsReducer(state = defaultTeams, action) {
  switch (action.type) {
    case ActionTypes.GET_TEAM_IDS:
      return Object.assign({ }, state, {
        teams: action.teams.map(({ color, _id }) => ({
          color: color.name,
          id: _id,
        })),
      });

    case ActionTypes.TEAM_ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    case ActionTypes.GET_TEAM_INFO:
      return Object.assign({ }, state, { latestTeam: action.team });

    case ActionTypes.CLEAR_TEAM_ERROR:
      return Object.assign({}, state, { error: null });

    default:
      return state;
  }
}

export default TeamsReducer;

import { ActionTypes } from '../actions';

const defaultBuildings = {
  latestBuilding: {
    id: null,
    info: null,
    hex: null,
  },
  buildings: null,
  error: null,
  offset: 0,
};

function BuildingReducer(state = defaultBuildings, action) {
  switch (action.type) {
    case ActionTypes.NEW_BUILDING:
      return Object.assign({ }, state, {
        latestBuilding: {
          id: action.id,
          info: null,
        },
      });

    case ActionTypes.UPDATE_TEAM_BUILDING:
      return Object.assign({ }, state, {
        latestBuilding: {
          id: action.building.id,
          info: null,
          hex: action.building.hex,
        },
      });

    case ActionTypes.NEW_BUILDINGS:
      return Object.assign({ }, state, {
        offset: state.offset + 5,
      });

    case ActionTypes.BUILDING_ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    case ActionTypes.GET_BUILDING_IDS:
    case ActionTypes.GET_BUILDINGS_BBOX:
      return Object.assign({ }, state, { buildings: action.buildings });

    case ActionTypes.GET_LOCATION_INFO:
      return Object.assign({ }, state, { latestBuilding: action.building });

    case ActionTypes.CLEAR_BUILDING_ERROR:
      return Object.assign({}, state, { error: null });

    default:
      return state;
  }
}

export default BuildingReducer;

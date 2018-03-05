import { ActionTypes } from '../actions';

const defaultColors = {
  latestBuilding: {
    id: null,
    centroid: null,
  },
  buildings: null,
  error: null,
};

function BuildingReducer(state = defaultColors, action) {
  switch (action.type) {
    case ActionTypes.NEW_BUILDING:
      return Object.assign({ }, state, {
        latestBuilding: {
          id: action.id,
          centroid: null,
        },
      });

    case ActionTypes.BUILDING_ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    case ActionTypes.GET_BUILDING_IDS:
      return Object.assign({ }, state, {
        buildings: action.buildings.map(({ _id }) => (_id)),
      });

    case ActionTypes.GET_LOCATION_INFO:
      return Object.assign({ }, state, { latestBuilding: action.building });

    case ActionTypes.CLEAR_BUILDING_ERROR:
      return Object.assign({}, state, { error: null });

    default:
      return state;
  }
}

export default BuildingReducer;

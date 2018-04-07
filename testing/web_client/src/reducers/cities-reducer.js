import { ActionTypes } from '../actions';

const defaultCities = {
  latestCity: null,
  error: null,
};

function CitiesReducer(state = defaultCities, action) {
  switch (action.type) {
    case ActionTypes.ADD_CITY:
      console.log('hu');
      return Object.assign({ }, state, { latestCity: action.id });

    case ActionTypes.CITY_ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    case ActionTypes.CLEAR_CITY_ERROR:
      return Object.assign({}, state, { error: null });

    default:
      return state;
  }
}

export default CitiesReducer;

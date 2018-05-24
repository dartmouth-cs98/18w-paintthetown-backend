import axios from 'axios';
import { ROOT_URL } from '../';

const SATURATION = 1;

export const ActionTypes = {
  AUTH_USER: 'AUTH_USER',
  DEAUTH_USER: 'DEAUTH_USER',
  GET_USER_DATA: 'GET_USER_DATA',
  TOKENIZE_FACEBOOK_CODE: 'TOKENIZE_FACEBOOK_CODE',
  USER_ERROR: 'USER_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  COLOR_ERROR: 'COLOR_ERROR',
  BUILDING_ERROR: 'BUILDING_ERROR',
  TEAM_ERROR: 'TEAM_ERROR',
  CITY_ERROR: 'CITY_ERROR',
  PARTICLE_ERROR: 'PARTICLE_ERROR',
  RESET_ERROR: 'RESET_ERROR',
  CLEAR_USER_ERROR: 'CLEAR_USER_ERROR',
  CLEAR_AUTH_ERROR: 'CLEAR_AUTH_ERROR',
  CLEAR_COLOR_ERROR: 'CLEAR_COLOR_ERROR',
  CLEAR_BUILDING_ERROR: 'CLEAR_BUILDING_ERROR',
  CLEAR_TEAM_ERROR: 'CLEAR_TEAM_ERROR',
  CLEAR_CITY_ERROR: 'CLEAR_CITY_ERROR',
  CLEAR_PARTICLE_ERROR: 'CLEAR_PARTICLE_ERROR',
  CLEAR_RESET_ERROR: 'CLEAR_RESET_ERROR',
  NEW_COLOR: 'NEW_COLOR',
  GET_COLOR_DATA: 'GET_COLOR_DATA',
  GET_COLOR_IDS: 'GET_COLOR_IDS',
  GET_CITY_NAMES: 'GET_CITY_NAMES',
  NEW_BUILDING: 'NEW_BUILDING',
  NEW_BUILDINGS: 'NEW_BUILDINGS',
  GET_BUILDINGS_BBOX: 'GET_BUILDINGS_BBOX',
  GET_BUILDING_IDS: 'GET_BUILDING_IDS',
  GET_LOCATION_INFO: 'GET_LOCATION_INFO',
  GET_TEAM_IDS: 'GET_TEAM_IDS',
  GET_PARTICLES: 'GET_PARTICLES',
  UPDATE_TEAM_BUILDING: 'UPDATE_TEAM_BUILDING',
  GET_TEAM_INFO: 'GET_TEAM_INFO',
  ASSIGN_USER_TO_TEAM: 'ASSIGN_USER_TO_TEAM',
  UPDATE_USER_DATA: 'UPDATE_USER_DATA',
  ADD_CITY: 'ADD_CITY',
  ADD_PARTICLES: 'ADD_PARTICLES',
  RESET: 'RESET',
};

// trigger error
export const newError = (message, type) => ({ type, message });


// ERROR ACTIONS
export const clearError = (errorType) => (
  (dispatch) => {
    let type = null;

    switch (errorType) {
      case 'user':
        type = ActionTypes.CLEAR_USER_ERROR;
        break;
      case 'building':
        type = ActionTypes.CLEAR_BUILDING_ERROR;
        break;

      case 'auth':
        type = ActionTypes.CLEAR_AUTH_ERROR;
        break;

      case 'color':
        type = ActionTypes.CLEAR_COLOR_ERROR;
        break;

      default: break;
    }

    dispatch({ type });
  }
);


// USER ACTIONS
export const getUserData = () => (
  (dispatch) => {
    const token = localStorage.getItem('token');

    if (token === null) {
      return dispatch(newError(
        'User Data Failed: No token available.',
        ActionTypes.USER_ERROR,
      ));
    }

    return axios.get(`${ROOT_URL}/users`, {
      headers: { Authorization: `JWT ${token}` },
    })
    .then(response => {
      if (response.data.error) {
        dispatch(newError(
          `User Data Failed: ${response.data.error.errmsg}`,
          ActionTypes.USER_ERROR,
        ));
      } else {
        dispatch({ data: response.data, type: ActionTypes.GET_USER_DATA });
      }
    })
    .catch(error => {
      dispatch(newError(`User Data Failed: ${error}`, ActionTypes.USER_ERROR));
    });
  }
);

export const updateUserData = (field, value) => (
  (dispatch) => {
    const token = localStorage.getItem('token');

    if (token === null) {
      return dispatch(newError(
        'Update User Data Failed: No token available.',
        ActionTypes.USER_ERROR,
      ));
    }

    const body = {};

    body[field] = value;

    return axios.post(`${ROOT_URL}/users/updateInfo`, body, {
      headers: { Authorization: `JWT ${token}` },
    })
    .then(response => {
      if (response.data.error) {
        dispatch(newError(
          `Update User Data Failed: ${response.data.error.errmsg}`,
          ActionTypes.USER_ERROR,
        ));
      } else {
        dispatch({ data: response.data, type: ActionTypes.UPDATE_USER_DATA });
      }
    })
    .catch(error => {
      dispatch(newError(`Update User Data Failed: ${error}`, ActionTypes.USER_ERROR));
    });
  }
);


// AUTH ACTIONS
export function signupUser(user) {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/signup`, user)
    .then(response => {
      if (response.data.error) {
        dispatch(newError(
          `Sign Up Failed: ${response.data.error.errmsg}`,
          ActionTypes.AUTH_ERROR,
        ));
      } else {
        const token = response.data.token;

        localStorage.setItem('token', token);

        dispatch({ type: ActionTypes.AUTH_USER });
      }
    })
    .catch(error => {
      dispatch(newError(`Sign Up Failed: ${error}`, ActionTypes.AUTH_ERROR));
    });
  };
}

export function signinUser(user) {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/signin`, user)
    .then(response => {
      if (response.data.error) {
        dispatch(newError(
          `Sign In Failed: ${response.data.error.errmsg}`,
          ActionTypes.AUTH_ERROR,
        ));
      } else {
        const token = response.data.token;

        localStorage.setItem('token', token);

        dispatch({ type: ActionTypes.AUTH_USER });
      }
    })
    .catch(error => {
      dispatch(newError(`Sign In Failed: ${error}`, ActionTypes.AUTH_ERROR));
    });
  };
}


export function signOut(user) {
  return (dispatch) => {
    if (localStorage.token) {
      localStorage.removeItem('token');
    }

    dispatch({ type: ActionTypes.DEAUTH_USER });
  };
}




// COLOR ACTIONS
export const newColor = (color) => {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/colors`, color, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `New Color Failed: ${error}`,
          ActionTypes.COLOR_ERROR,
        ));
      } else {
        const id = response.data.id;
        dispatch({ type: ActionTypes.NEW_COLOR, id });
      }
    })
    .catch(error => {
      dispatch(newError(`New Color Failed: ${error}`, ActionTypes.COLOR_ERROR));
    });
  };
};


export const getColorIDs = (offset) => {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/colors/ids`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
      params: { offset },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `Get Color IDs Failed: ${error}`,
          ActionTypes.COLOR_ERROR,
        ));
      } else {
        const colors = response.data.colors;
        dispatch({ type: ActionTypes.GET_COLOR_IDS, colors });
      }
    })
    .catch(error => {
      dispatch(newError(
        `Get Color IDs Failed: ${error}`,
        ActionTypes.COLOR_ERROR,
      ));
    });
  };
};

export const getColorData = (id) => (
  (dispatch) => {
    return axios.get(`${ROOT_URL}/colors`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
      params: { id },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `Get Color Failed: ${error}`,
          ActionTypes.COLOR_ERROR,
        ));
      } else {
        dispatch({ type: ActionTypes.GET_COLOR_DATA, hex: response.data.hex });
      }
    })
    .catch(error => {
      dispatch(newError(`Get Color Data Failed: ${error}`, ActionTypes.COLOR_ERROR));
    });
  }
);


// BUILDING ACTIONS
export const newBuildings = (buildings) => {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/buildings`, { buildings }, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `New Buildings Failed: ${error}`,
          ActionTypes.BUILDING_ERROR,
        ));
      } else {
        dispatch({ type: ActionTypes.NEW_BUILDINGS });
      }
    })
    .catch(error => {
      dispatch(newError(
        `New Buildings Failed: ${error}`,
        ActionTypes.BUILDING_ERROR,
      ));
    });
  };
};


export const getBuildingIDs = (offset, extraFields) => {
  return (dispatch) => {
    const params = { offset };

    if (extraFields) { params.extraFields = extraFields; }

    axios.get(`${ROOT_URL}/buildings`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
      params,
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `Get Building IDs Failed: ${error}`,
          ActionTypes.BUILDING_ERROR,
        ));
      } else {
        const buildings = response.data.buildings;
        dispatch({ type: ActionTypes.GET_BUILDING_IDS, buildings });
      }
    })
    .catch(error => {
      dispatch(newError(
        `Get Building IDs Failed: ${error}`,
        ActionTypes.BUILDING_ERROR,
      ));
    });
  };
};

export const getBuildingsBbox = (bbox, teamOnly, extraFields) => {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/buildings`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
      params: Object.assign(extraFields.length > 0 ? { extraFields } : {}, {
        bbox,
        teamOnly,
        saturation: SATURATION,
      }),
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;

        dispatch(newError(
          `Get Buildings Bbox Failed: ${error}`,
          ActionTypes.BUILDING_ERROR,
        ));
      } else {
        const buildings = response.data.buildings;
        dispatch({ type: ActionTypes.GET_BUILDINGS_BBOX, buildings });
      }
    })
    .catch(error => {
      dispatch(newError(
        `Get Buildings Bbox Failed: ${error}`,
        ActionTypes.BUILDING_ERROR,
      ));
    });
  };
};


export const getBuildingInfo = (id, field) => {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/buildings/info`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
      params: { id, fields: [field], saturation: SATURATION },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `Get Building Info Failed: ${error}`,
          ActionTypes.BUILDING_ERROR,
        ));
      } else {
        const info = { field, data: response.data[field] };

        dispatch({
          type: ActionTypes.GET_LOCATION_INFO,
          building: { id, info },
        });
      }
    })
    .catch(error => {
      dispatch(newError(
        `Get Building Info Failed: ${error}`,
        ActionTypes.BUILDING_ERROR,
      ));
    });
  };
};

export const updateTeamBuilding = (body) => {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/buildings/updateTeam`, Object.assign({
      saturation: 1,
    }, body), {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
    })
    .then(response => {
      console.log(response);
      if (response.data.error) {
        const error = response.data.error.errmsg;

        dispatch(newError(
          `Update Team Building Info Failed: ${error}`,
          ActionTypes.BUILDING_ERROR,
        ));
      } else {
        dispatch({
          type: ActionTypes.UPDATE_TEAM_BUILDING,
          building: response.data.building,
        });
      }
    })
    .catch(error => {
      dispatch(newError(
        `Update Team Building Info Failed: ${error}`,
        ActionTypes.BUILDING_ERROR,
      ));
    });
  };
};

// PARTICLE ACTIONS
export const addParticles = (particles) => {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/particles`, { particles }, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `Add Particles Failed: ${error}`,
          ActionTypes.PARTICLE_ERROR,
        ));
      } else {
        const { data: { message } } = response;
        dispatch({ type: ActionTypes.ADD_PARTICLES, message });
      }
    })
    .catch(error => {
      dispatch(newError(`Add Particles Failed: ${error}`, ActionTypes.PARTICLE_ERROR));
    });
  };
};


export const getParticles = (buildingId) => {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/particles`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
      params: { buildingId },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `Get Particles Failed: ${error}`,
          ActionTypes.PARTICLE_ERROR,
        ));
      } else {
        const { particles } = response.data;
        dispatch({ type: ActionTypes.GET_PARTICLES, particles });
      }
    })
    .catch(error => {
      dispatch(newError(
        `Get Particles Failed: ${error}`,
        ActionTypes.PARTICLE_ERROR,
      ));
    });
  };
};


// TEAM ACTIONS
export const getTeamIDs = (offset) => {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/teams`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
      params: { offset },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `Get Team IDs Failed: ${error}`,
          ActionTypes.TEAM_ERROR,
        ));
      } else {
        const teams = response.data.teams;
        dispatch({ type: ActionTypes.GET_TEAM_IDS, teams });
      }
    })
    .catch(error => {
      dispatch(newError(
        `Get Team IDs Failed: ${error}`,
        ActionTypes.TEAM_ERROR,
      ));
    });
  };
};

export const getTeamInfo = (id, field) => {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/teams/info`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
      params: { id, fields: [field] },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `Get Team Info Failed: ${error}`,
          ActionTypes.TEAM_ERROR,
        ));
      } else {
        const info = { field, data: response.data[field] };

        dispatch({
          type: ActionTypes.GET_TEAM_INFO,
          team: { id, info },
        });
      }
    })
    .catch(error => {
      dispatch(newError(
        `Get Team Info Failed: ${error}`,
        ActionTypes.TEAM_ERROR,
      ));
    });
  };
};

export const assignUserToTeam = (team) => {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/users`, { team }, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;

        dispatch(newError(
          `Update Team User Failed: ${error}`,
          ActionTypes.TEAM_ERROR,
        ));
      } else {
        dispatch({
          type: ActionTypes.ASSIGN_USER_TO_TEAM,
          team: response.data.team,
        });
      }
    })
    .catch(error => {
      dispatch(newError(
        `Update Team User Failed: ${error}`,
        ActionTypes.TEAM_ERROR,
      ));
    });
  };
};


// CITY ACTIONS
export const addCity = (data) => {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/cities`, data, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `New City Failed: ${error}`,
          ActionTypes.CITY_ERROR,
        ));
      } else {
        dispatch({ type: ActionTypes.ADD_CITY, id: response.data.id });
      }
    })
    .catch(error => {
      dispatch(newError(
        `New City Failed: ${error}`,
        ActionTypes.CITY_ERROR,
      ));
    });
  };
};

export const getCityNames = (id) => (
  (dispatch) => {
    return axios.get(`${ROOT_URL}/cities/names`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
      params: { id },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `Get City Names Failed: ${error}`,
          ActionTypes.COLOR_ERROR,
        ));
      } else {
        dispatch({ type: ActionTypes.GET_CITY_NAMES, hex: response.data.hex });
      }
    })
    .catch(error => {
      dispatch(newError(`Get City Names Failed: ${error}`, ActionTypes.CITY_ERROR));
    });
  }
);


// RESET ACTIONS
export const resetDB = (collections, adminPassword) => {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/reset`, { collections }, {
      headers: { Authorization: `ADMIN ${adminPassword}` },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;

        dispatch(newError(
          `Reset Failed: ${error}`,
          ActionTypes.RESET_ERROR,
        ));
      } else {
        dispatch({
          type: ActionTypes.RESET,
          message: response.data.message,
        });
      }
    })
    .catch(error => {
      dispatch(newError(
        `Reset Failed: ${error}`,
        ActionTypes.RESET_ERROR,
      ));
    });
  };
};

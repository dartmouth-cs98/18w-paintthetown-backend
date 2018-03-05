import axios from 'axios';
import { ROOT_URL } from '../';


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
  CLEAR_USER_ERROR: 'CLEAR_USER_ERROR',
  CLEAR_AUTH_ERROR: 'CLEAR_AUTH_ERROR',
  CLEAR_COLOR_ERROR: 'CLEAR_COLOR_ERROR',
  CLEAR_BUILDING_ERROR: 'CLEAR_BUILDING_ERROR',
  CLEAR_TEAM_ERROR: 'CLEAR_TEAM_ERROR',
  NEW_COLOR: 'NEW_COLOR',
  GET_COLOR_DATA: 'GET_COLOR_DATA',
  NEW_BUILDING: 'NEW_BUILDING',
  GET_BUILDING_IDS: 'GET_BUILDING_IDS',
  GET_LOCATION_INFO: 'GET_LOCATION_INFO',
  GET_TEAM_IDS: 'GET_TEAM_IDS',
  UPDATE_TEAM_BUILDING: 'UPDATE_TEAM_BUILDING',
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

// export function facebookAuth() {
//   return (dispatch) => {
//     axios.get(`${ROOT_URL}/auth/facebook`, { headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Content-Type': 'application/json',
//     } })
//     .then(response => {
//       if (response.data.error) {
//         dispatch(authError(`Sign in Failed: ${response.data.error.errmsg}`));
//       } else {
//         const token = response.data.token;
//
//         localStorage.setItem('token', token);
//
//         dispatch({ type: ActionTypes.AUTH_USER });
//       }
//     })
//     .catch(error => {
//       dispatch(authError(`Facebook auth failed: ${error}`));
//     });
//   };
// }


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
      dispatch(newError(`Get Color Failed: ${error}`, ActionTypes.COLOR_ERROR));
    });
  }
);


// BUILDING ACTIONS
export const newBuilding = ({
  id,
  name,
  centroidLng,
  centroidLat,
  baseAltitude,
  topAltitude,
}) => {
  return (dispatch) => {
    const building = {
      id,
      name,
      centroid: [centroidLng, centroidLat],
      baseAltitude,
      topAltitude,
    };
    axios.post(`${ROOT_URL}/buildings`, building, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;
        dispatch(newError(
          `New Building Failed: ${error}`,
          ActionTypes.BUILDING_ERROR,
        ));
      } else {
        dispatch({ type: ActionTypes.NEW_BUILDING, id: response.data.id });
      }
    })
    .catch(error => {
      dispatch(newError(
        `New Building Failed: ${error}`,
        ActionTypes.BUILDING_ERROR,
      ));
    });
  };
};


export const getBuildingIDs = (offset) => {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/buildings`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
      params: { offset },
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


export const getBuildingInfo = (id, field) => {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/buildings/info`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
      params: { id, fields: [field] },
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
    axios.post(`${ROOT_URL}/buildings/updateTeam`, body, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
    })
    .then(response => {
      if (response.data.error) {
        const error = response.data.error.errmsg;

        dispatch(newError(
          `Update Team Building Info Failed: ${error}`,
          ActionTypes.BUILDING_ERROR,
        ));
      } else {
        dispatch({
          type: ActionTypes.UPDATE_TEAM_BUILDING,
          team: response.data.team,
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

import axios from 'axios';

import { ROOT_URL } from '../';

export const ActionTypes = {
  AUTH_USER: 'AUTH_USER',
  DEAUTH_USER: 'DEAUTH_USER',
  GET_USER_DATA: 'GET_USER_DATA',
  TOKENIZE_FACEBOOK_CODE: 'TOKENIZE_FACEBOOK_CODE',
  ERROR: 'ERROR',
  NEW_COLOR: 'NEW_COLOR',
  GET_COLOR_DATA: 'GET_COLOR_DATA',
};

// USER ACTIONS
export const getUserData = () => (
  (dispatch) => {
    const token = localStorage.getItem('token');

    if (token === null) {
      return dispatch(authError('User Data Failed: No token available.'));
    }

    return axios.get(`${ROOT_URL}/users`, {
      headers: { Authorization: `JWT ${token}` },
    })
    .then(response => {
      if (response.data.error) {
        dispatch(authError(`User Data Failed: ${response.data.error.errmsg}`));
      } else {
        dispatch({ data: response.data, type: ActionTypes.GET_USER_DATA });
      }
    })
    .catch(error => {
      dispatch(authError(`User Data Failed: ${error}`));
    });
  }
);


// AUTH ACTIONS
export function signupUser(user) {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/signup`, user)
    .then(response => {
      if (response.data.error) {
        dispatch(authError(`Sign Up Failed: ${response.data.error.errmsg}`));
      } else {
        const token = response.data.token;

        localStorage.setItem('token', token);

        dispatch({ type: ActionTypes.AUTH_USER });
      }
    })
    .catch(error => {
      dispatch(authError(`Sign Up Failed: ${error}`));
    });
  };
}

export function signinUser(user) {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/signin`, user)
    .then(response => {
      if (response.data.error) {
        dispatch(authError(`Sign in Failed: ${response.data.error.errmsg}`));
      } else {
        const token = response.data.token;

        localStorage.setItem('token', token);

        dispatch({ type: ActionTypes.AUTH_USER });
      }
    })
    .catch(error => {
      dispatch(authError(`Sign in Failed: ${error}`));
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

export function facebookAuth() {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/auth/facebook`, { headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    } })
    .then(response => {
      if (response.data.error) {
        dispatch(authError(`Sign in Failed: ${response.data.error.errmsg}`));
      } else {
        const token = response.data.token;

        localStorage.setItem('token', token);

        dispatch({ type: ActionTypes.AUTH_USER });
      }
    })
    .catch(error => {
      dispatch(authError(`Facebook auth failed: ${error}`));
    });
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
        dispatch(authError(`New Color Failed: ${response.data.error.errmsg}`));
      } else {
        const id = response.data.id;
        dispatch({ type: ActionTypes.NEW_COLOR, id });
      }
    })
    .catch(error => {
      dispatch(authError(`New Color Failed: ${error}`));
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
        dispatch(authError(`Color Data Failed: ${response.data.error.errmsg}`));
      } else {
        dispatch({ type: ActionTypes.GET_COLOR_DATA, hex: response.data.hex });
      }
    })
    .catch(error => {
      dispatch(authError(`Color Data Failed: ${error}`));
    });
  }
);


// trigger error
export function authError(error) {
  return {
    type: ActionTypes.ERROR,
    message: error,
  };
}

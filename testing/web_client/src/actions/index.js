import axios from 'axios';

import { ROOT_URL } from '../';

export const ActionTypes = {
  AUTH_USER: 'AUTH_USER',
  DEAUTH_USER: 'DEAUTH_USER',
  GET_USER_DATA: 'GET_USER_DATA',
  TOKENIZE_FACEBOOK_CODE: 'TOKENIZE_FACEBOOK_CODE',
};

// USER ACTIONS

export const getUserData = () => (
  (dispatch) => {
    axios.get(`${ROOT_URL}/users`, {
      headers: { Authorization: `JWT ${localStorage.getItem('token')}` },
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

export const exchangeCodeForToken = (code) => (
  dispatch => {
    axios.get(`${ROOT_URL}/facebook/tokenize`, { params: { code } })
    .then(response => {
      if (response.data.error) {
        dispatch(authError(`Facebook Tokenization Failed: ${response.data.error.errmsg}`));
      } else {
        dispatch({
          token: response.data.token,
          type: ActionTypes.TOKENIZE_FACEBOOK_CODE,
        });
      }
    })
    .catch(error => {
      dispatch(authError(`Facebook Tokenization Failed: ${error}`));
    });
  }
);


export function signupUser(user) {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/signup`, user)
    .then(response => {
      if (response.data.error) {
        dispatch(authError(`Sign Up Failed: ${response.data.error.errmsg}`));
      } else {
        const token = response.data.token;
        const id = response.data.id;

        localStorage.setItem('token', token);
        localStorage.setItem('id', id);
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
        const email = response.data.email;

        localStorage.setItem('token', token);
        localStorage.setItem('email', email);
        dispatch({ type: ActionTypes.AUTH_USER });
      }
    })
    .catch(error => {
      dispatch(authError(`Sign in Failed: ${error}`));
    });
  };
}


export function signoutUser(user) {
  return (dispatch) => {
    if (localStorage.token) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
    }

    if (localStorage.signup) {
      localStorage.removeItem('signup');
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

// trigger to deauth if there is error
// can also use in your error reducer if you have one to display an error message
export function authError(error) {
  return {
    type: ActionTypes.AUTH_ERROR,
    message: error,
  };
}

import axios from 'axios';

// const ROOT_URL = 'https://paint-the-town.herokuapp.com/api';
const ROOT_URL = 'http://localhost:9090/api';

export const ActionTypes = {
  AUTH_USER: 'AUTH_USER',
  DEAUTH_USER: 'DEAUTH_USER',
};

// USER ACTIONS

export function signupUser(user) {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/signup`, user)
    .then(response => {
      console.log(response);
      if (response.data.error) {
        dispatch(authError(`Sign Up Failed: ${response.data.error.errmsg}`));
      } else {
        const token = response.data.token;
        const id = response.data.id;

        localStorage.setItem('token', token);
        localStorage.setItem('id', id);
        console.log(token);
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
      console.log(response);
      if (response.data.error) {
        dispatch(authError(`Sign in Failed: ${response.data.error.errmsg}`));
      } else {
        const token = response.data.token;
        const email = response.data.email;

        localStorage.setItem('token', token);
        localStorage.setItem('email', email);
        console.log(token);
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

// trigger to deauth if there is error
// can also use in your error reducer if you have one to display an error message
export function authError(error) {
  return {
    type: ActionTypes.AUTH_ERROR,
    message: error,
  };
}

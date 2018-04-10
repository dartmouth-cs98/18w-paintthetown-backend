import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import App from './components/app';

import './style.scss';

import reducers from './reducers';

// export const ROOT_URL = 'https://paint-the-town.herokuapp.com/api';
export const ROOT_URL = 'http://localhost:9090/api';

const store = createStore(reducers, {}, compose(
  applyMiddleware(thunk),
  window.devToolsExtension ? window.devToolsExtension() : f => f
));

// entry point that just renders app
// could be used for routing at some point
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
  , document.getElementById('main'));

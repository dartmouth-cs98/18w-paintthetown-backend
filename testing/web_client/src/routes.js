import React from 'react';
// import { Route } from 'react-router';
import { Route, Switch } from 'react-router-dom';

import App from './components/app';
import Users from './components/users';

export default(
  <Switch>
    <Route exact path="/" component={App} />
    <Route path="/users" component={Users} />
  </Switch>
);

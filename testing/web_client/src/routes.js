import React from 'react';
import { Route, Switch } from 'react-router';

import App from './components/app';
import Users from './components/users';

console.log(Switch);

export default(
  <Switch>
    <Route exact path="/" component={App} />
    <Route path="/users" component={Users} />
  </Switch>
);

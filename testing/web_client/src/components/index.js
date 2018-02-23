import React, { Component } from 'react';
import { BrowserRouter as NavLink } from 'react-router-dom';

// example class based component (smart component)
class Index extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {};
  }

  render() {
    return (
      <nav id="menu">
        <ul>
          <li><NavLink to="/users">Users</NavLink></li>
        </ul>
      </nav>
    );
  }
}

export default Index;

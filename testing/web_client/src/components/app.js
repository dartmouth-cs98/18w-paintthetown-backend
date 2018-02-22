import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';

import { exchangeCodeForToken } from '../actions';

const mapStateToProps = (state) => ({
  users: state.users,
});


import Index from './index';

// example class based component (smart component)
class App extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {};
  }

  componentDidMount() {
    const { query } = this.props.location;

    if (Object.prototype.hasOwnProperty.call(query, 'code')) {
      this.props.exchangeCodeForToken(query.code);
    }
  }

  componentWillReceiveProps(props) {
    if (props.users.tokenizedFacebookCode !== null &&
        this.props.users.tokenizedFacebookCode === null) {
      localStorage.setItem('token', props.users.tokenizedFacebookCode);
      browserHistory.push('/');
    }
  }

  render() {
    return (
      <div id="main-container">
        <Index />
      </div>
    );
  }
}

export default connect(mapStateToProps, { exchangeCodeForToken })(App);

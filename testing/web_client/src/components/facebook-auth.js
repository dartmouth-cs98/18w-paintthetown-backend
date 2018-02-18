import React, { Component } from 'react';
import { connect } from 'react-redux';

import { ROOT_URL } from '../';
import { signupUser } from '../actions';

function isComplete(data) {
  const keys = Object.keys(data)
  .reduce((a, k) => (k === 'middleName' ? a : a.concat(k)), []);
  const arr = keys.map(k => (data[k]));

  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i].length === 0) { return false; }
  }

  return data.password === data.confirmPassword;
}

const mapStateToProps = (state) => (
  {
    auth: state.auth,
  }
);

// example class based component (smart component)
class SignUp extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      data: {
        name: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        isComplete: false,
      },
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(type, e) {
    const { data } = this.state;

    data[type] = e.target.value;

    this.setState({ data, isComplete: isComplete(data) });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.signupUser(this.state.data);
  }

  render() {
    return (
      <div id="facebook" className={this.props.toggled ? 'normal' : 'hidden'}>
        <a href={`${ROOT_URL}/auth/facebook`}>Sign In with Facebook</a>
      </div>
    );
  }
}

export default connect(mapStateToProps, { signupUser })(SignUp);

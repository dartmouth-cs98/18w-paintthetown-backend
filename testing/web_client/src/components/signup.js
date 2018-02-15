import React, { Component } from 'react';
import { connect } from 'react-redux';

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
      <div id="signup" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <input autoComplete="on" type="text" placeholder="* Name" value={this.state.data.name} onChange={e => { this.onChange('name', e); }} />
          <input autoComplete="on" type="text" placeholder="Middle Name" value={this.state.data.middleName} onChange={e => { this.onChange('middleName', e); }} />
          <input autoComplete="on" type="text" placeholder="* Last Name" value={this.state.data.lastName} onChange={e => { this.onChange('lastName', e); }} />
          <input autoComplete="on" type="email" placeholder="* Email" value={this.state.data.email} onChange={e => { this.onChange('email', e); }} />
          <input autoComplete="on" type="password" placeholder="* Password" value={this.state.data.password} onChange={e => { this.onChange('password', e); }} />
          <input autoComplete="on" type="password" placeholder="* Confirm Password" value={this.state.data.confirmPassword} onChange={e => { this.onChange('confirmPassword', e); }} />
          <input type="submit" value="Submit" disabled={!this.state.isComplete} />
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps, { signupUser })(SignUp);

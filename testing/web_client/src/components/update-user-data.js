import React, { Component } from 'react';
import { connect } from 'react-redux';

import { updateUserData } from '../actions';

const mapStateToProps = ({ users }) => ({ users });

// example class based component (smart component)
class UpdateUserData extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      field: null,
      value: null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.users.error !== null &&
        props.users.error !== this.props.users.error) {
      this.props.displayError(props.users.error, 'users');
    }
  }

  onChange(e) {
    const field = e.target.value;

    if (field !== 'default') {
      this.setState({ field });
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.updateUserData(this.state.field, this.state.value);
  }

  render() {
    return (
      <div id="update-user-data" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <select onChange={this.onChange} >
            <option value="default">Select field to update...</option>
            <option value="name">Name</option>
            <option value="middleName">Middle name</option>
            <option value="lastName">Last name</option>
          </select>
          <input
            type="text"
            placeholder="New value"
            onChange={(e) => { this.setState({ value: e.target.value }); }}
          />
          <input
            type="submit"
            disabled={this.state.value === null || this.state.value.length === 0 || this.state.field === null}
            value="Update"
          />
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps, {
  updateUserData,
})(UpdateUserData);

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { signinUser } from '../actions';

function isComplete(data) {
  const arr = Object.values(data);

  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i].length === 0) { return false; }
  }

  return true;
}

const mapStateToProps = (state) => (
  {
    auth: state.auth,
  }
);

// example class based component (smart component)
class SignIn extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      data: {
        name: '',
        centroid: [null, null],
        baseAltitude: null,
        topAltitude: null,
        city: '',
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

    this.props.signinUser(this.state.data);
  }

  render() {
    return (
      <div className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <input autoComplete="on" type="text" placeholder="* Name" value={this.state.data.name} onChange={e => { this.onChange('name', e); }} />
          <input
            autoComplete="on"
            type="number"
            placeholder="* Centroid Latitude"
            value={
              this.state.data.centroid[0] === null ?
              0 :
              this.state.data.centroid[0]
            }
            onChange={e => { this.onChange('centroid', e); }} />
          <input type="submit" value="Submit" disabled={!this.state.isComplete} />
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps, { signinUser })(SignIn);

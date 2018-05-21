import React, { Component } from 'react';

// example class based component (smart component)
class UserData extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      currentId: '',
    };

    this.determineData = this.determineData.bind(this);
  }

  determineData() {
    if (!Object.prototype.hasOwnProperty.call(localStorage, 'token') ||
        localStorage.getItem('token') === null) {
      return <h1>No token available</h1>;
    }

    if (this.props.userData) {
      return (<div>
        <h1>{`Name: ${this.props.userData.name}`}</h1>
        <h1>{`Middle name: ${this.props.userData.middleName}`}</h1>
        <h1>{`Last name: ${this.props.userData.lastName}`}</h1>
        <h1>{`Email: ${this.props.userData.email}`}</h1>
        <h1>{`Paint left: ${this.props.userData.paintLeft}`}</h1>
        <h1>{`Time left: ${this.props.userData.timeLeftMin}:${this.props.userData.timeLeftSec}`}</h1>
        <h1>{`Type of login: ${this.props.userData.typeOfLogin}`}</h1>
        <h1>{`Role: ${this.props.userData.role}`}</h1>
        <h1>{`Buildings painted: ${this.props.userData.buildingsPainted}`}</h1>
        <h1>{`Cities painted: ${this.props.userData.citiesPainted.length}`}</h1>
      </div>);
    }

    return <h1>Loading...</h1>;
  }

  render() {
    return (
      <div id="user-data" className={this.props.toggled ? 'normal' : 'hidden'}>
        {this.determineData()}
      </div>
    );
  }
}

export default UserData;

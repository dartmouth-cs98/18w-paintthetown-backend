import React, { Component } from 'react';

// example class based component (smart component)
class UserData extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      currentId: '',
    };
  }

  render() {
    console.log(this.props.userData);
    return (
      <div id="user-data" className={this.props.toggled ? 'normal' : 'hidden'}>
        {this.props.userData ?
        (<div>
          <h1>{`Name: ${this.props.userData.name}`}</h1>
          <h1>{`Middle Name: ${this.props.userData.middleName}`}</h1>
          <h1>{`Last Name: ${this.props.userData.lastName}`}</h1>
          <h1>{`Email: ${this.props.userData.email}`}</h1>
        </div>) : <h1>Loading...</h1>}
      </div>
    );
  }
}

export default UserData;

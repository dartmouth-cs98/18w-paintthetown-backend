import React, { Component } from 'react';

// example class based component (smart component)
class App extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      currentId: '',
    };
  }

  render() {
    return (
      <div className={this.props.toggled ? 'normal' : 'hidden'}>
      </div>
    );
  }
}

export default App;

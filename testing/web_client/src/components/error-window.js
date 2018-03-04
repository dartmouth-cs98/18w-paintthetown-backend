import React, { Component } from 'react';

// example class based component (smart component)
class ErrorWindow extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {};
  }

  render() {
    return (
      <div id="error" className={this.props.error === null ? 'hidden' : 'normal'}>
        <h1>{this.props.error}</h1>
      </div>
    );
  }
}

export default ErrorWindow;

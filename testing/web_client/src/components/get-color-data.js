import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getColorData, getColorIDs } from '../actions';

const mapStateToProps = (state) => (
  {
    colors: state.colors,
  }
);

// example class based component (smart component)
class GetColorData extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      id: null,
      name:null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getColorIDs = this.getColorIDs.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.colors.error !== null &&
        props.colors.error !== this.props.colors.error) {
      this.props.displayError(props.colors.error, 'color');
    }
  }

  onChange(e) {
    const val = e.target.value;

    this.setState({ id: val === 'Select color id...' ? null : val });
  }

  getColorIDs() {
    if (this.props.colors.colors === null) {
      return <option value="Loading...">Loading...</option>;
    }

    return ['Select color id...'].concat(this.props.colors.colors)
    .map(id => (
      <option value={id} key={id}>{id}</option>
    ));
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.getColorData(this.state.id);
  }

  render() {
    return (
      <div id="get-color-data" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <select
            onChange={this.onChange}
            disabled={this.props.colors.colors === null}
          >{this.getColorIDs()}</select>
          <input
            type="submit"
            disabled={this.state.id === null}
            value="Submit"
          />
        </form>
        <h1>{
          this.props.colors.latestID === null ?
          ' ' :
          `name: ${this.props.colors.latestID}`
        }</h1>
      </div>
    );
  }
}

export default connect(mapStateToProps, { getColorData, getColorIDs })(GetColorData);

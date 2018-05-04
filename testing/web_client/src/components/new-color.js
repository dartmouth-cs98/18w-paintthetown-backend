import React, { Component } from 'react';
import { connect } from 'react-redux';

import { newColor } from '../actions';

import { inRange } from '../../../../app/utils';
import { rgbToHex } from '../../../../app/utils/color';

function isComplete(data) {
  const arr = Object.values(data);

  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i].length === 0) { return false; }
  }

  return true;
}

const mapStateToProps = (state) => (
  {
    colors: state.colors,
  }
);

const validateRGB = (val) => (val.length > 0 && inRange(val, 0, 255));

const validators = {
  r: validateRGB,
  g: validateRGB,
  b: validateRGB,
};

// example class based component (smart component)
class NewColor extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      data: {
        name: '',
        r: 0,
        g: 0,
        b: 0,
        hex: '#000000',
      },
      isComplete: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.colors.error !== null &&
        props.colors.error !== this.props.colors.error) {
      this.props.displayError(props.colors.error, 'color');
    }
  }

  onChange(type, e) {
    const { data } = this.state;

    if (!Object.prototype.hasOwnProperty.call(validators, type) ||
        validators[type](e.target.value)) {
      if (type === 'r' || type === 'g' || type === 'b') {
        data[type] = `${parseInt(e.target.value, 10)}`;
        data.hex = rgbToHex(['r', 'g', 'b'].map(k => (data[k])));
      } else {
        data[type] = e.target.value;
      }
    }

    this.setState({ data, isComplete: isComplete(data) });
  }

  handleSubmit(e) {
    const rgb = [this.state.r, this.state.g, this.state.b];

    e.preventDefault();

    this.props.newColor(Object.assign(this.state.data, { rgb }));
  }

  render() {
    return (
      <div id="new-color" className={this.props.toggled ? 'normal' : 'hidden'}>
        <form autoComplete="on" onSubmit={this.handleSubmit}>
          <input autoComplete="on" type="text" placeholder="* Color Name" value={this.state.data.name} onChange={e => { this.onChange('name', e); }} />
          <input
            autoComplete="on"
            type="number"
            placeholder="* R"
            min="0"
            max="255"
            step="1"
            value={this.state.data.r}
            onChange={e => { this.onChange('r', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="* G"
            min="0"
            max="255"
            step="1"
            value={this.state.data.g}
            onChange={e => { this.onChange('g', e); }}
          />
          <input
            autoComplete="on"
            type="number"
            placeholder="* B"
            min="0"
            max="255"
            step="1"
            value={this.state.data.b}
            onChange={e => { this.onChange('b', e); }}
          />
          <input
            autoComplete="on"
            type="text"
            placeholder="* Hexadecimal"
            value={this.state.data.hex}
            onChange={e => { this.onChange('hex', e); }}
          />
          <input type="submit" value="Submit" disabled={!this.state.isComplete} />
        </form>
      </div>
    );
  }
}

export default connect(mapStateToProps, { newColor })(NewColor);

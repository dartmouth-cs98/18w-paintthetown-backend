import React, { Component } from 'react';
import { connect } from 'react-redux';

import { resetDB } from '../actions';

const mapStateToProps = (state) => ({
  reset: state.reset,
});

const MODELS = [
  'Building',
  'Challenge',
  'City',
  'Particle',
  'Team',
  'User',
];

function isComplete(data) {
  return data.adminPassword !== '';
}

// example class based component (smart component)
class Reset extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      toggled: false,
      adminPassword: '',
      models: {
        users: false,
        teams: false,
        colors: false,
      },
      isComplete: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onOptionChange = this.onOptionChange.bind(this);
    this.generateChecklist = this.generateChecklist.bind(this);
  }

  componentWillReceiveProps(props) {
    if (!props.toggled && this.props.toggled) {
      this.setState({
        toggled: false,
      });
    }

    if (props.reset.error !== null &&
        props.reset.error !== this.props.reset.error) {
      this.props.displayError(props.reset.error, 'reset');
    }
  }

  onOptionChange(e) {
    const type = e.target.value;
    const newState = this.state;

    newState.models[type] = e.target.checked;

    this.setState(Object.assign(newState, { isComplete: isComplete(newState) }));
  }

  onChange(type, e) {
    const data = this.state;
    const val = e.target.value;

    data[type] = val;

    this.setState(Object.assign(data, { isComplete: isComplete(data) }));
  }

  handleSubmit(e) {
    e.preventDefault();

    let models = Object.keys(this.state.models).reduce((arr, key) => (
      this.state.models[key] ? arr.concat(key) : arr
    ), []);

    if (models.length === MODELS.length) { models = []; }

    this.props.resetDB(models, this.state.adminPassword);
  }

  generateChecklist() {
    return MODELS.map(model => (
      <div key={model} className="option">
        <input
          autoComplete="on"
          type="checkbox"
          name="models"
          id={`${model}-checkbox`}
          value={model}
          onChange={this.onOptionChange}
        />
        <label htmlFor={`${model}-checkbox`}>{`${model.substring(0, 1).toUpperCase()}${model.substring(1)}`}</label>
      </div>
    ));
  }

  render() {
    return (
      <div id="reset">
        <div
          className={`large-tab${this.props.toggled ? ' active' : ''}`}
          onClick={() => { this.props.toggle('reset'); }}
        >Reset</div>
        <div className="tab" onClick={() => {
          this.setState({
            toggled: !this.state.toggled,
          });
        }}>Reset Database</div>
        <div id="reset-db" className={this.state.toggled ? 'normal' : 'hidden'}>
          <form autoComplete="on" onSubmit={this.handleSubmit}>
            <div className="checklist">{this.generateChecklist()}</div>
            <input
              autoComplete="on"
              type="password"
              placeholder="* Admin Password"
              value={this.state.adminPassword}
              onChange={e => { this.onChange('adminPassword', e); }}
            />
            <input type="submit" value="Submit" disabled={!this.state.isComplete} />
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, { resetDB })(Reset);

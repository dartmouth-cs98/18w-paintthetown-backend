import { ActionTypes } from '../actions';

const defaultParticles = {
  particles: null,
  message: null,
  error: null,
};

function ParticlesReducer(state = defaultParticles, action) {
  switch (action.type) {
    case ActionTypes.GET_PARTICLES:
      return Object.assign({ }, state, {
        particles: action.particles,
      });

    case ActionTypes.PARTICLE_ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    case ActionTypes.ADD_PARTICLES:
      return Object.assign({ }, state, {
        message: action.message,
      });

    case ActionTypes.CLEAR_PARTICLE_ERROR:
      return Object.assign({}, state, { error: null });

    default:
      return state;
  }
}

export default ParticlesReducer;

import { ActionTypes } from '../actions';

const defaultParticles = {
  particles: null,
  error: null,
};



function ParticlesReducer (state = defaultParticles, action) {
  switch (action.type) {
    case ActionTypes.GET_PARTICLES:
      console.log(action.particles);
      console.log("hi got here lol");
      return Object.assign({ }, state, {
        particles: action.particles,
      });

    case ActionTypes.PARTICLES_ERROR:
      return Object.assign({}, state, {
        error: action.message,
      });

    case ActionTypes.ADD_PARTICLES:
      console.log("hi this is particles length "+ action.particles.length);
      if (action.particles.length > 0){
        console.log("added particles for building " + action.particles[0].buildingId + " and particles are "+ action.particles);
      } else {
        console.log("no particles given to add to a building");
      }
      console.log("hi got here lol");
      return Object.assign({ }, state, {
        particles: action.particles,
      });

    case ActionTypes.CLEAR_PARTICLES_ERROR:
      return Object.assign({}, state, { error: null });

    default:
      return state;
    }
  }

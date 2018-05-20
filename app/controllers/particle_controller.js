import mongoose from 'mongoose';

import Particle from '../models/particle_model.js';

export const addParticles = (req, res) => {
  const { particles = null } = req.body;

  if (particles === null) {
    res.json({ error: {
      errmsg: 'addParticles need \'buildingId\' and \'particles\' fields.',
    } });
  } else {
    const newParticlesArray = particles.map(p => (new Particle(p)));

    Promise.all(newParticlesArray.map(p => (p.save())))
    .then(() => {
      const { length: n } = particles;
      const message = `Added ${n} particle${n === 1 ? '' : 's'}`;
      console.log(`POST:\t${message}.`);

      res.json({ message });
    })
    .catch(error => { res.json({ error: { errmsg: error.message } }); });
  }
};

// // GET request
export const getParticles = (req, res) => {
  const { buildingId: building = null } = req.query;

  if (building === null) {
    res.json({
      error: { errmsg: 'Particles query needs a \'buildingId\' field.' },
    });
  } else {
    Particle.find({ building })
    .then(particles => {
      const { length: n } = particles;
      console.log(`GET:\tSending ${n} particle${n === 1 ? '' : 's'} for building ${building}.`);
      res.json({ particles });
    })
    .catch(error => {
      console.log(`ERROR: ${error.message}.`);
      res.json({ error: { errmsg: error.message } });
    });
  }
};

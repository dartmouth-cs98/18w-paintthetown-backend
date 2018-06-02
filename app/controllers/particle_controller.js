import mongoose from 'mongoose';

import Particle from '../models/particle_model.js';

import { generalLog } from '../utils';

export const addParticles = (req, res) => {
  const { particles = null } = req.body;

  if (particles === null) {
    res.json({ error: {
      errmsg: 'addParticles need \'buildingId\' and \'particles\' fields.',
    } });
  } else {
    // const ParticlesArray = req.Items;
    // ParticlesArray.forEach(function(p,i) {
    //   p = new Particle(p);
    //   ParticlesArray[i] = p;
    // });

    const ParticlesArray = particles.Items.map(p => (new Particle(p)));

    Promise.all(ParticlesArray.map(p => (p.save())))
    .then(() => {
      const message = generalLog('Added', 'particle', particles);

      res.json({ message, _logMsg: message });
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
      const _logMsg = generalLog('Added', 'particle', particles,
                                 ` for building ${building}`);
      res.json({ particles, _logMsg });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

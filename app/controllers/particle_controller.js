import Particle from '../models/particle_model.js';

import { checkBuildingFace } from '../utils';

import { hasProps, hasProp } from '../utils';

export const addParticles = (req,res) => {
  if (!hasProps(req.body,['buildingId','particlesArray'])){
    res.json({
      error: 'addParticles need \'buildingId\' and \'particlesArray\' fields.',
    });
  } else {
    const particlesArray = req.body.particlesArray;
    const newParticlesArray = [];
    const buildingID = req.body.id;
    for (var i =0; i<particlesArray; i=i+1){
      const particle = new Particle();
      particle.pos = particlesArray[i].pos;
      particle.size = particlesArray[i].size;
      particle.rotation = particlesArray[i].rotation;
      particle.color = particlesArray[i].color;
      particle.building = req.body.buildingId;
      newParticlesArray.push(particle);
    }
    console.log(`here`);
    Promise.all(newParticlesArray.map(particle => newParticle(particle)))
    .then(() => {
      const message = `Added particles for ${particle.building} .`;
      console.log(`POST:\t${message}`);

      res.json({ message });
    })
    .catch(error => { res.json({ error: { errmsg: error.message } }); });
  }
};




function newParticle(particleData) {
  return new Promise((resolve, reject) => {
    if (!hasProps(particleData, [
      'pos',
      'size',
      'rotation',
      'color',
      'building',
    ])) {
      reject({
        message: 'Particle needs \'pos\', \'size\', \'rotation\', \'color\', and \'building\' fields.',
      });
    } else {
      const particle = new Particle();
      particle.pos = particleData.pos
      particle.size = particleData.size;
      particle.rotation = particleData.rotation;
      particle.color = particleData.color;
      particle.building = particleData.building;

      particle.save()
      .then(result => { resolve(); })
      .catch(error => { reject(error); });
    }
  })

}

// // GET request
export const getParticles = (req, res) => {
  if (!hasProps(req.query, ['buildingId'])) {
    res.json({
      error: { errmsg: 'Particles query needs a \'buildingId\' field.' },
    });
  } else {
    const building =mongoose.Types.ObjectId(req.body.buildingId);
    Particle.find({ building })
    .then(result => {
      console.log(`GET:\tSending particles for building ${result.buildingId}.`);
      res.json(result.team);
    })
    .catch(error => {
      console.log('ERROR: building does not exist.');
      res.json({ error: { errmsg: error.message } });
    });

};
}

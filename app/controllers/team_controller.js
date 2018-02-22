import Team from '../models/team_model.js';

import { hasProps } from '../utils';


export const createTeam = (req, res) => {
  if (!hasProps(req.body, ['color', 'name'])) {
    res.json({
      error: 'Teams need \'name\' and \'color\' fields.',
    });
  } else {
    const team = new Team();

    team.color = req.body.color;
    team.name = req.body.name;

    team.save()
    .then(result => {
      console.log(`POST:\tAdded team ${team.name}.`);

      res.json({ id: result._id, name: result.name });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

export const countUsersInTeam = (req, res) => {
  if (!hasProps(req.params, ['id'])) {
    res.json({
      error: 'Teams need \'name\' and \'color\' fields.',
    });
  } else {
    User.find({ team: req.params.id })
    .then(users => {
      return User.find({ team: req.params.id });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

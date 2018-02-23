import Team from '../models/team_model.js';

import { hasProps } from '../utils';


export const createTeam = (req, res) => {
  if (!hasProps(req.body, ['name', 'color', 'type'])) {
    res.json({
      error: 'Teams need \'name\', \'color\', and \'type\' fields.',
    });
  } else {
    const team = new Team();

    team.color = req.body.color;
    team.name = req.body.name;
    team.type = req.body.team;

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

export const countUsers = (req, res) => {
  if (!hasProps(req.params, ['id'])) {
    res.json({
      error: 'countUsers needs an \'id\' field (id of team).',
    });
  } else {
    User.find({ team: req.params.id })
    .then(userCount => {
      return User.count({ team: req.params.id }).exec();
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

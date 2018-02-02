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
      console.log(`POST: Added team ${team.name}.`);

      res.json({ id: result._id, name: result.name });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

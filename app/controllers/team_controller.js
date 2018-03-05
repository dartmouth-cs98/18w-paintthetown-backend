import mongoose from 'mongoose';

import Team from '../models/team_model.js';
import User from '../models/user_model.js';

import { hasProps, hasProp } from '../utils';


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

export const getTeamIDs = (req, res) => {
  const offset = hasProp(req.query, 'offset') ? parseInt(req.query.offset, 10) : 0;

  Team.find({}, ['_id'], {
    skip: offset,
    limit: offset + 5,
    sort: { name: 1 },
  })
  .then(teams => {
    console.log(`GET:\tSending ${teams.length} team ID${teams.length === 1 ? '' : 's'}.`);

    res.json({ teams });
  })
  .catch(error => {
    res.json({ error: { errmsg: error.message } });
  });
};

export const countUsers = (req, res) => {
  if (!hasProps(req.query, ['id'])) {
    res.json({
      error: 'countUsers needs an \'id\' field (id of team).',
    });
  } else {
    const team = mongoose.Types.ObjectId(req.query.id);

    User.find({ team }, ['_id']).count()
    .then(userCount => {
      res.json({ userCount });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

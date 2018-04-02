import mongoose from 'mongoose';

import Team from '../models/team_model.js';
import User from '../models/user_model.js';
import Building from '../models/building_model.js';

import { hasProps, hasProp } from '../utils';

function populateTeamField(response, field, data) {
  return new Promise((resolve, reject) => {
    const { _id } = data;

    if (hasProp(data, field)) {
      const newObj = {};

      newObj[field] = data[field];

      Object.assign(response, newObj);

      resolve();
    } else if (field === 'members' || field === 'nMembers') {
      User.find({ team: _id }, ['_id'])
      .then(members => {
        if (field === 'members') {
          Object.assign(response, { members });
        } else {
          Object.assign(response, { nMembers: members.length });
        }

        resolve();
      })
      .catch(error => { reject(error); });
    } else if (field === 'nBuildings') {
      Building.find({ team: _id }, ['_id'])
      .then(buildings => {
        Object.assign(response, { nBuildings: buildings.length });

        resolve();
      })
      .catch(error => { reject(error); });
    } else {
      reject({ message: `teams don't have property  \'${field}\'.` });
    }
  });
}

function findTeamData(id, fields) {
  return new Promise((resolve, reject) => {
    const normalFields = [];
    const augmentedFields = [];

    fields.forEach(field => {
      if (field === 'members' || fields === 'nMembers' ||
          fields === 'nBuildings') {
        augmentedFields.push(field);
      } else {
        normalFields.push(field);
      }
    });

    const finalObj = {};

    if (normalFields.length > 0) {
      Team.findById(id, normalFields)
      .then(response => (
        Promise.all(fields.map(field => (
          populateTeamField(finalObj, field, response._doc)
        )))
      ))
      .then(() => { resolve(finalObj); })
      .catch(error => { reject(error); });
    } else {
      Promise.all(fields.map(field => (
        populateTeamField(finalObj, field, {})
      )))
      .then(() => { resolve(finalObj); })
      .catch(error => { reject(error); });
    }
  });
}


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

  Team.find({}, ['_id', 'color'], {
    skip: offset,
    limit: offset + 5,
    sort: { name: 1 },
  })
  .populate('color', 'name')
  .then(teams => {
    console.log(`GET:\tSending ${teams.length} team ID${teams.length === 1 ? '' : 's'}.`);

    res.json({ teams });
  })
  .catch(error => {
    res.json({ error: { errmsg: error.message } });
  });
};

export const getInfo = (req, res) => {
  if (!hasProps(req.query, ['id', 'fields'])) {
    res.json({
      error: { errmsg: 'getInfo needs a team \'id\' and \'fields\' field.' },
    });
  } else {
    const { fields } = req.query;
    const id = req.query.id;

    findTeamData(id, fields)
    .then(result => {
      res.json(result);
      console.log(`GET:\tSending data for team with id ${id}.`);
    })
    .catch(error => {
      console.log('ERROR: faulty query.');
      res.json({ error: { errmsg: error.message } });
    });
  }
};

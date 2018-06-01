import jwt from 'jwt-simple';
import mongoose from 'mongoose';

import User from '../models/user_model';
import Challenge from '../models/challenge_model';
import City from '../models/city_model';

import { hasProps, hasProp, functionCalls, MAX_FN_CALLS, printStats } from '../utils';
import { reduceChallenges } from '../utils/challenge';
import { computeTeamOwnership } from '../utils/team';

import config from '../config';


const { apiKeys: { API_SECRET }, timers } = config;

// encodes a new token for a user object
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  const sub = user.id ? user.id : user._id;

  return jwt.encode({ sub, iat: timestamp }, API_SECRET);
}


export const signUp = (req, res) => {
  if (!hasProps(req.body, ['name', 'lastName'])) {
    res.json({
      error: {
        errmsg: 'Users need \'email\', \'password\', \'name\', and \'lastName\' fields',
      },
    });
  } else {
    const user = new User();

    if (hasProps(req.body, ['email', 'password'])) {
      user.email = req.body.email;
      user.password = req.body.password;
      user.typeOfLogin = 'email';
    } else {
      res.json({ error: 'Unsupported signup method.' });
    }

    user.name = req.body.name;
    user.lastName = req.body.lastName;
    user.role = 'user';

    let name = `${user.name} `;

    if (hasProp(req.body, 'middleName')) {
      user.middleName = req.body.middleName;

      name += `${user.middleName} `;
    }

    name += user.lastName;

    Challenge.find({ level: 1 })
    .then(challenges => {
      user.challenges = challenges;

      user.save()
      .then(result => {
        const token = tokenForUser(result);

        console.log(`POST:\tAdded user ${name}.`);

        res.json({ token, id: result._id });
      })
      .catch(error => { res.json({ error: { errmsg: error.message } }); });
    })
    .catch(error => { res.json({ error: { errmsg: error.message } }); });
  }
};

export const signIn = (req, res) => {
  const { user } = req;

  console.log(`POST:\tUser signin: ${user.name} ${user.lastName}.`);

  const token = tokenForUser(user);

  res.json({ token });
};

export const getUserData = async (req, res) => {
  if (!hasProp(functionCalls, 'getUserData')) {
    functionCalls.getUserData = [];
  }

  functionCalls.getUserData
  .push({ start: Date.now() });

  const user = req.user;
  const timeLeft = timers.timeLeft(user._id);
  const obj = Object.assign({}, user._doc);

  let timeLeftSec = null;
  let timeLeftMin = null;
  let error = null;

  if (timeLeft !== null) {
    ({ secs: timeLeftSec, mins: timeLeftMin } = timeLeft);
  }

  Object.assign(obj, { timeLeftSec, timeLeftMin });

  const challenges = await reduceChallenges(user.level, user.challenges)
  .catch(e => { error = e; });

  if (error !== null) {
    res.json({ error: { errmsg: error.message } });
    return;
  }

  const cities = await City.find({ _id: { $in: user.citiesPainted } }, ['name'])
  .catch(e => { error = e; });

  if (error !== null) {
    res.json({ error: { errmsg: error.message } });
    return;
  }

  const citiesPainted = cities.map(({ _doc: { name } }) => (name));

  const teamOwnership = await computeTeamOwnership(user.team)
  .catch(e => { error = e; });

  if (error !== null) {
    res.json({ error: { errmsg: error.message } });
    return;
  }

  const response = Object.assign({}, obj, {
    challenges,
    citiesPainted,
    teamOwnership,
  });

  console.log(`GET:\tSending user data for ${user.name} ${user.lastName}.`);

  const { length: n } = functionCalls.getUserData;

  functionCalls.getUserData[n - 1].end = Date.now();

  if (functionCalls.getUserData.length === MAX_FN_CALLS) {
    printStats('getUserData', functionCalls.getUserData);
    functionCalls.getUserData = [];
  }

  res.json(response);
};

export const addUserToTeam = (req, res) => {
  if (!hasProp(req.body, ['team'])) {
    res.json({
      error: { errmsg: 'Query needs \'email\' field.' },
    });
  } else {
    const user = req.user;
    const _id = user._id;
    const team = req.body.team;

    User.update({ _id }, { team })
    .then(result => {
      console.log(`POST:\tAdded user ${user.name} ${user.lastName} to team with id ${team}.`);

      res.json({ user: _id, team });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

export const updateUserData = (req, res) => {
  const updateObj = {};
  const user = req.user;
  const _id = user._id;

  if (hasProp(req.body, 'name')) {
    updateObj.name = req.body.name;
  }

  if (hasProp(req.body, 'lastName')) {
    updateObj.lastName = req.body.lastName;
  }

  if (hasProp(req.body, 'middleName')) {
    updateObj.middleName = req.body.middleName;
  }

  User.update({ _id }, updateObj)
  .then(result => {
    console.log(`POST:\tData updated for user with id ${_id}.`);

    res.json({ message: 'Done' });
  })
  .catch(error => {
    res.json({ error: { errmsg: error.message } });
  });
};


export const addFriend = (req, res) => {
  if (!hasProp(req.body, ['friend'])) {
    res.json({
      error: { errmsg: 'Query needs \'email\' field.' },
    });
  } else {
    const user = req.user;
    const _id = user._id;
    const friend = mongoose.Types.ObjectId(req.body.friend);
    const friends = user.friends.concat(friend);

    User.update({ _id }, { friends })
    .then(result => (User.findById(friend)))
    .then(otherUser => {
      const otherFriends = otherUser.friends.concat(_id);

      User.update({ _id: friend }, { friends: otherFriends })
      .then(result => {
        console.log(`POST:\tAdded ${user.name} ${user.lastName} and ${otherUser.name} ${otherUser.lastName} to each other's friend lists.`);

        res.json({
          user: _id,
          friends,
          otherUser: otherUser._id,
          otherFriends,
        });
      })
      .catch(error => {
        res.json({ error: { errmsg: error.message } });
      });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

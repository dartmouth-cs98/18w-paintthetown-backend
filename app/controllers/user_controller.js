import jwt from 'jwt-simple';
import config from '../config';
import mongoose from 'mongoose';

import User from '../models/user_model.js';
import { hasProps, hasProp } from '../utils';

// encodes a new token for a user object
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  const sub = user.id ? user.id : user._id;

  return jwt.encode({ sub, iat: timestamp }, config.secret);
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

    user.save()
    .then(result => {
      const token = tokenForUser(result);

      console.log(`POST:\tAdded user ${name}.`);

      res.json({ token, id: result._id });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
};

export const signIn = (req, res) => {
  const { user } = req;

  console.log(`POST:\tUser signin: ${user.name} ${user.lastName}.`);

  const token = tokenForUser(user);

  res.json({ token });
};

export const getUserData = (req, res) => {
  const user = req.user;

  console.log(`GET:\tSending user data for ${user.name} ${user.lastName}.`);

  res.json(user);
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
      console.log(`PUT:\tAdded user ${user.name} ${user.lastName} to team with id ${team}.`);

      res.json({ user: _id, team });
    })
    .catch(error => {
      res.json({ error: { errmsg: error.message } });
    });
  }
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

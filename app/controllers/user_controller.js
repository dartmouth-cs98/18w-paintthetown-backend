import User from '../models/user_model.js';
import jwt from 'jwt-simple';
import config from '../config';

import { hasProps, hasProp } from '../utils';

// encodes a new token for a user object
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  const sub = user.id ? user.id : user._id;

  return jwt.encode({ sub, iat: timestamp }, config.secret);
}


export const signUp = (req, res) => {
  if (!hasProps(req.body, ['email', 'password', 'name', 'lastName'])) {
    res.json({
      error: 'Users need \'email\', \'password\', \'name\', and \'lastName\' fields',
    });
  } else {
    const user = new User();

    user.email = req.body.email;
    user.password = req.body.password;
    user.name = req.body.name;
    user.lastName = req.body.lastName;

    let name = `${user.name} `;

    if (hasProp(req.body, 'middleName')) {
      user.middleName = req.body.middleName;

      name += `${user.middleName} `;
    }

    name += user.lastName;

    user.save()
    .then(result => {
      const token = tokenForUser(result);

      console.log(`POST: Added user ${name}.`);

      res.json({ token, email: result.email });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

export const findUser = (req, res) => {
  if (!hasProp(req.body, ['email'])) {
    res.json({
      error: 'Query needs \'email\' field.',
    });
  } else {
    const email = req.body.email;

    User.findOne({ email })
    .then(user => {
      console.log(`GET: Found user ${user.name} ${user.lastName}.`);

      res.json({ user });
    })
    .catch(error => {
      res.json({ error: error.message });
    });
  }
};

export const addUserToTeam = (req, res) => {
  if (!hasProp(req.body, ['team'])) {
    res.json({
      error: 'Query needs \'email\' field.',
    });
  } else {
    // const email = req.body.email;

    console.log(req);

    res.json({ error: 'huh' });

    // User.findOne({ email })
    // .then(user => {
    //   console.log(`GET: Found user ${user.name} ${user.lastName}.`);
    //
    //   res.json({ user });
    // })
    // .catch(error => {
    //   res.json({ error: error.message });
    // });
  }
};

import mongoose from 'mongoose';

import Challenges from '../models/challenge_model';
import Users from '../models/user_model';

import config from '../config';

function getNextChallenges(u) {
  return new Promise((resolve, reject) => {
    const { _doc: { _id, level: l } } = u;
    const level = l + 1;

    Users.update({ _id }, { level })
    .then(res => (Challenges.find({ level }, ['_id'])))
    .then(challenges => { resolve(challenges); })
    .catch(error => { reject(error); });
  });
}

export const toggleChallenges = (req, res) => {
  const { body: { challenges: c = null }, user } = req;

  if (c === null) {
    res.json({ error: { errmsg: 'request needs a \'challenges\' field.' } });
    return;
  }

  const pendingUser = user.challenges.map((challenge) => {
    const { _doc = null } = challenge;

    if (_doc === null) { return `${challenge}`; }

    return `${_doc._id}`;
  });

  for (let i = 0; i < c.length; i += 1) {
    if (typeof pendingUser.find(ch => (ch === `${c[i]}`)) === 'undefined') {
      res.json({ error: {
        errmsg: `${user.name} ${user.lastName} does not currently have the challenge with id ${c[i]}`,
      } });
      return;
    }
  }

  const $in = c.map(mongoose.Types.ObjectId);

  Challenges.find({ _id: { $in } })
  .then(challenges => {
    const diff = user.challenges.reduce((arr, challenge) => {
      const { _doc = null } = challenge;
      const id = _doc === null ? `${challenge}` : `${_doc._id}`;
      const match = challenges.find(ch => (`${ch._id}` === id));

      if (typeof match === 'undefined') { arr.push(id); }

      return arr;
    }, []);
    const totReward = challenges.reduce((tot, { reward }) => (
      tot + reward
    ), 0);

    const update = {
      paintLeft: user.paintLeft + totReward,
      challenges: diff,
    };

    config.timers.cancelConditional(
      user._id,
      `Stopped ${user.name} ${user.lastName}'s paint supply automatic restock`,
      update.paintLeft,
      config.gameSettings.paint.MAX_RESTOCK,
    );

    if (update.challenges.length === 0) {
      getNextChallenges(user)
      .then(newChallenges => {
        update.challenges = newChallenges;

        Users.update({ _id: user._id }, update)
        .then(response => (Users.findById(user._id)))
        .then(u => {
          res.json({ challenges, user: u });
        })
        .catch(error => { res.json({ error: { errmsg: error.message } }); });
      })
      .catch(error => {
        res.json({ error: { errmsg: error.message } });
      });

      return;
    }

    Users.update({ _id: user._id }, update)
    .then(response => (Users.findById(user._id)))
    .then(u => {
      res.json({ challenges, user: u });
    })
    .catch(error => { res.json({ error: { errmsg: error.message } }); });
  })
  .catch(error => { res.json({ error: { errmsg: error.message } }); });
};

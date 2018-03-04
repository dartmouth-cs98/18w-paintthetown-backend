import Color from './models/color_model';
import Team from './models/team_model';
import User from './models/user_model';

import config from './config';

export default (collections) => (new Promise((resolve, reject) => {
  const red = new Color();
  const blue = new Color();

  const redTeam = new Team();
  const blueTeam = new Team();

  const users = config.adminData.map((data) => (
    new User(Object.assign({}, data, {
      role: 'admin',
      typeOfLogin: 'email',
    })))
  );

  console.log(users);

  red.name = 'red';
  red.hex = '#ff0000';
  red.rgb = [255, 0, 0];

  blue.name = 'blue';
  blue.hex = '#0000ff';
  blue.rgb = [0, 0, 255];

  redTeam.name = 'Red Team';
  redTeam.color = red._id;
  redTeam.type = 'global';

  blueTeam.name = 'Blue Team';
  blueTeam.color = blue._id;
  blueTeam.type = 'global';

  Promise.all([red, blue].map(color => (color.save())))
  .then(res => (Promise.all([redTeam, blueTeam].map(team => (team.save())))))
  .then(res => (Promise.all(users.map(user => (user.save())))))
  .then(res => { resolve(); })
  .catch(error => { reject(error); });
}));

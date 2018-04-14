import fs from 'fs';

import Color from './models/color_model';
import Team from './models/team_model';
import User from './models/user_model';
import City from './models/city_model';
import Building from './models/building_model';

import config from './config';

function addCity(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/cities/${filename}`, (err, bytes) => {
      if (err) {
        reject(err);
      } else {
        const buildings = JSON.parse(bytes);
        const [name, centroid, minCoord, maxCoord] = filename.split('_');
        const [centroidLng, centroidLat] = centroid.split(',').map(x => (
          parseFloat(x)
        ));
        const [minLng, minLat] = minCoord.split(',').map(x => (
          parseFloat(x)
        ));
        const [maxLng, maxLat] = maxCoord.split(',').map(x => (
          parseFloat(x)
        ));

        const city = new City({
          name,
          centroid: [centroidLng, centroidLat],
          bbox: [minLng, minLat, maxLng, maxLat],
        });

        city.save()
        .then(result => {
          const { _id } = result._doc;

          return Promise.all(buildings.map(building => {
            const build = new Building({
              name: building.name,
              id: building.id,
              city: _id,
              centroidLng: building.centroidLng,
              centroidLat: building.centroidLat,
              baseAltitude: building.baseAltitude,
              topAltitude: building.topAltitude,
            });

            return build.save();
          }));
        })
        .then(res => {
          console.log(`\t•Added ${buildings.length} building${buildings.length === 1 ? '' : 's'} to city ${name}.`);

          resolve();
        })
        .catch(error => { reject(error); });
      }
    });
  });
}

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

  fs.readdir(`${__dirname}/cities/`, (err, dir) => {
    if (err) { return reject(err); }

    return Promise.all([red, blue].map(color => (color.save())))
    .then(res => {
      console.log('\t•Added 2 colors.');

      return Promise.all([redTeam, blueTeam].map(team => (team.save())));
    })
    .then(res => {
      console.log('\t•Added 2 teams.');

      return Promise.all(users.map(user => (user.save())));
    })
    .then(res => {
      console.log(`\t•Added ${res.length} user${res.length === 1 ? '' : 's'}.`);

      return Promise.all(dir.map(city => (addCity(city))));
    })
    .then(res => { resolve(); })
    .catch(error => { reject(error); });
  });
}));

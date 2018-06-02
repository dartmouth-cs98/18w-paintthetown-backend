import dotenv from 'dotenv';
import Timers from '../utils/timer';

dotenv.config();

const {
  RESTOCK_INTERVAL,
  BUILDINGS_PER_RESTOCK,
  MAX_RESTOCK,
  INITIAL_PAINT,
  MAX_TEAMS,
  API_SECRET,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  TRACK_RUNNING_TIME = false,
} = process.env;
const ADMINS = ['ACACIA', 'MAU', 'WYATT', 'TED', 'ALEX', 'MORGAN'];
const DATA_FIELDS = [
  'FIRST_NAME',
  'MIDDLE_NAME',
  'LAST_NAME',
  'EMAIL',
  'PASSWORD',
];

const trackRunnningTime = {};

if (TRACK_RUNNING_TIME) {
  Object.assign(trackRunnningTime, {
    updateTeam: 1,
    getBuildingIDs: 1,
    getUserData: 1,
  });
}

const adminData = ADMINS.map(name => (
  DATA_FIELDS.reduce((data, field) => {
    const obj = {};
    const [w1, ...w2] = field.split('_');
    const envKey = `${field}_${name}`;
    let configKey = w1.toLowerCase();

    if (w2.length > 0) {
      configKey += `${w2[0].charAt(0)}${w2[0].slice(1).toLowerCase()}`;
    }

    obj[configKey === 'firstName' ? 'name' : configKey] = process.env[envKey];

    return Object.assign(data, obj);
  }, {})
));

const adminTokens = ADMINS.map(name => (process.env[`ADMIN_TOKEN_${name}`]));

const apiKeys = {
  API_SECRET,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
};

const gameSettings = {
  paint: {
    RESTOCK_INTERVAL,
    BUILDINGS_PER_RESTOCK,
    MAX_RESTOCK,
    INITIAL_PAINT,
  },
  teams: {
    MAX_TEAMS,
  },
  trackRunnningTime,
};

const timers = new Timers();

Object.keys(gameSettings)
.reduce((arr, key) => {
  if (key !== 'trackRunnningTime') { arr.push(key); }

  return arr;
}, [])
.forEach(type => {
  Object.keys(gameSettings[type])
  .forEach(field => {
    gameSettings[type][field] = parseInt(gameSettings[type][field], 10);
  });
});


export default {
  adminData,
  adminTokens,
  apiKeys,
  gameSettings,
  timers,
};

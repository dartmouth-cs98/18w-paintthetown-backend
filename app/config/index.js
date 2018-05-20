import dotenv from 'dotenv';


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
} = process.env;
const ADMINS = ['ACACIA', 'MAU', 'WYATT', 'TED', 'ALEX', 'MORGAN'];
const DATA_FIELDS = [
  'FIRST_NAME',
  'MIDDLE_NAME',
  'LAST_NAME',
  'EMAIL',
  'PASSWORD',
];


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
};

Object.keys(gameSettings).forEach(type => {
  Object.keys(gameSettings[type]).forEach(field => {
    gameSettings[type][field] = parseInt(gameSettings[type][field], 10);
  });
});


export default { adminData, adminTokens, apiKeys, gameSettings };

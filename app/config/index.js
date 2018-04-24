import dotenv from 'dotenv';

dotenv.config();

export default {
  maxTeams: 10,
  secret: process.env.API_SECRET,
  facebookAppId: process.env.FACEBOOK_APP_ID,
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
  adminTokens: [
    process.env.ADMIN_TOKEN_MAU,
    process.env.ADMIN_TOKEN_ACACIA,
    process.env.ADMIN_TOKEN_MORGAN,
    process.env.ADMIN_TOKEN_TED,
    process.env.ADMIN_TOKEN_ALEX,
    process.env.ADMIN_TOKEN_WYATT,
  ],
  adminData: [{
    name: process.env.FIRST_NAME_MAU,
    middleName: process.env.MIDDLE_NAME_MAU,
    lastName: process.env.LAST_NAME_MAU,
    email: process.env.EMAIL_MAU,
    password: process.env.PASSWORD_MAU,
  }, {
    name: process.env.FIRST_NAME_ACACIA,
    middleName: process.env.MIDDLE_NAME_ACACIA,
    lastName: process.env.LAST_NAME_ACACIA,
    email: process.env.EMAIL_ACACIA,
    password: process.env.PASSWORD_ACACIA,
  }, {
    name: process.env.FIRST_NAME_MORGAN,
    middleName: process.env.MIDDLE_NAME_MORGAN,
    lastName: process.env.LAST_NAME_MORGAN,
    email: process.env.EMAIL_MORGAN,
    password: process.env.PASSWORD_MORGAN,
  }, {
    name: process.env.FIRST_NAME_TED,
    middleName: process.env.MIDDLE_NAME_TED,
    lastName: process.env.LAST_NAME_TED,
    email: process.env.EMAIL_TED,
    password: process.env.PASSWORD_TED,
  }, {
    name: process.env.FIRST_NAME_ALEX,
    middleName: process.env.MIDDLE_NAME_ALEX,
    lastName: process.env.LAST_NAME_ALEX,
    email: process.env.EMAIL_ALEX,
    password: process.env.PASSWORD_ALEX,
  }, {
    name: process.env.FIRST_NAME_WYATT,
    middleName: process.env.MIDDLE_NAME_WYATT,
    lastName: process.env.LAST_NAME_WYATT,
    email: process.env.EMAIL_WYATT,
    password: process.env.PASSWORD_WYATT,
  }],
};

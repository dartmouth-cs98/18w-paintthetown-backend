import dotenv from 'dotenv';

dotenv.config();

export default {
  secret: process.env.API_SECRET,
  facebookAppId: process.env.FACEBOOK_APP_ID,
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
  adminTokens: [
    process.env.ADMIN_TOKEN_MAU,
  ],
  adminData: [{
    name: process.env.FRIST_NAME_MAU,
    middleName: process.env.MIDDLE_NAME_MAU,
    lastName: process.env.LAST_NAME_MAU,
    email: process.env.EMAIL_MAU,
    password: process.env.PASSWORD_MAU,
  }],
};

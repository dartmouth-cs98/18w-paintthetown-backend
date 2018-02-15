import dotenv from 'dotenv';

dotenv.config();

export default {
  secret: process.env.API_SECRET,
  facebookAppId: process.env.FACEBOOK_APP_ID,
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
};

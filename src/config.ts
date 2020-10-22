/* eslint-disable node/no-process-env */
import { config as loadEnv } from 'dotenv';

loadEnv();

const config = {
  debug: process.env.NODE_ENV !== 'production',
  uploader: {
    base: process.env.UPLOADER_BASE,
  },
  jwt: {
    secret: <string>process.env.JWT_SECRET,
    audience: process.env.JWT_AUDIENCE || 'showcase',
  },
};

export default config;

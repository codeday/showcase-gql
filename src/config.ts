/* eslint-disable node/no-process-env */
import { config as loadEnv } from 'dotenv';

loadEnv();

const config = {
  debug: process.env.NODE_ENV !== 'production',
  port: Number.parseInt(<string>process.env.PORT, 10) || 5000,
  uploader: {
    base: <string>process.env.UPLOADER_BASE,
    secret: process.env.UPLOADER_SECRET,
  },
  jwt: {
    secret: <string>process.env.JWT_SECRET,
    audience: process.env.JWT_AUDIENCE || 'showcase',
  },
};

export default config;

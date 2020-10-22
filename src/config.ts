/* eslint-disable node/no-process-env */
import { config as loadEnv } from 'dotenv';

loadEnv();

const config = {
  debug: process.env.NODE_ENV !== 'production',
  discord: {
    botToken: process.env.DISCORD_BOT_TOKEN,
    channel: process.env.DISCORD_CHANNEL,
    approverRole: process.env.DISCORD_APPROVER_ROLE,
  },
  uploader: {
    base: process.env.UPLOADER_BASE,
  },
};

export default config;

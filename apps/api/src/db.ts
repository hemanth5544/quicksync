import mongoose from 'mongoose';
import { logger } from '@quick-sync/logger';
import { getAPIConfig } from '@quick-sync/config';

const config = getAPIConfig();
const MONGO_URI = config.mongoUri;

async function connectToDb() {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('MongoDB connected', { uri: MONGO_URI });
  } catch (err) {
    logger.error('MongoDB connection error', { error: err });
    process.exit(1);
  }
}

connectToDb();

export default mongoose;
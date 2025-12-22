import mongoose from 'mongoose';
import { logger } from '@quick-sync/logger';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/session-api';

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
const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduloop';

  try {
    // Attempt standard connection first with a short timeout to prevent long hangs if local mongod is not running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB connected successfully to: ${uri}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to MongoDB at ${uri}: ${err.message}`);
    console.log('[Database] Starting embedded MongoMemoryServer for instant zero-config operation...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Embedded in-memory MongoDB running at ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start embedded MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  // Check if seeding is needed
  try {
    const { checkAndSeedData } = require('../seed/seedData');
    await checkAndSeedData();
  } catch (seedErr) {
    console.warn('[Database] Auto-seed check failed:', seedErr.message);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };

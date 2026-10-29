const mongoose = require('mongoose');
const config = require('./config');

let memoryServer = null;

const connectDB = async () => {
  try {
    // Attempt standard connection first with short timeout to detect if local/remote MongoDB is up
    console.log(`[CineBook DB] Attempting connection to MongoDB at ${config.mongodbUri}...`);
    
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000
    });
    
    console.log(`[CineBook DB] Successfully connected to MongoDB at ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (err) {
    console.warn(`[CineBook DB] Could not connect to external MongoDB: ${err.message}`);
    
    if (config.nodeEnv === 'production') {
      console.error('[CineBook DB] Production mode requires a valid MONGODB_URI.');
      throw err;
    }

    // In development or test, fall back to mongodb-memory-server for zero-setup local execution
    console.log('[CineBook DB] Starting in-memory MongoDB Server for seamless zero-setup local development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      
      await mongoose.connect(memoryUri);
      console.log(`[CineBook DB] Connected to In-Memory MongoDB (${memoryUri})`);
      
      // Auto-seed in-memory database if empty
      const { autoSeedIfEmpty } = require('../seed/seeder');
      await autoSeedIfEmpty();
      
      return mongoose.connection;
    } catch (memErr) {
      console.error('[CineBook DB] In-memory MongoDB failed to start:', memErr.message);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    console.log('[CineBook DB] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('[CineBook DB] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };

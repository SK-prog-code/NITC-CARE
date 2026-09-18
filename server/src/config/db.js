const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ccms';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(` Could not connect to primary MongoDB at "${uri}": ${err.message}`);
    console.log('⚡ Starting embedded in-memory MongoDB server for local development...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(` In-Memory MongoDB Connected at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(' Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

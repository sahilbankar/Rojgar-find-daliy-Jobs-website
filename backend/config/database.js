const mongoose = require('mongoose');

// Configure global Mongoose settings
mongoose.set('strictQuery', false);
// Re-enable query buffering (default: true) so Mongoose gracefully buffers operations
// during connection establishment instead of crashing or freezing
mongoose.set('bufferCommands', true);

let isConnected = false;
let connectingPromise = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rojgar';

  // State 1 = Connected
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  // State 2 = Connecting: Await existing connection promise if one is already in-flight
  if (mongoose.connection.readyState === 2 && connectingPromise) {
    return connectingPromise;
  }

  // Initiate connection if disconnected (0) or disconnecting (3)
  connectingPromise = (async () => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000, // Fail fast after 10 seconds if DB is unreachable
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true
      });

      isConnected = true;
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      isConnected = false;
      throw error;
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected! Driver attempting background reconnection...');
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

module.exports = connectDB;

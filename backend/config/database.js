const mongoose = require('mongoose');

// Configure global Mongoose settings
mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', true);

let isConnected = false;
let connectingPromise = null;

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/rojgar';

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || DEFAULT_LOCAL_URI;

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
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 8000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true
      });

      isConnected = true;
      console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
      return conn;
    } catch (primaryError) {
      console.error(`❌ Primary MongoDB Connection Error (${primaryUri.includes('mongodb+srv') ? 'Atlas' : 'Local'}): ${primaryError.message}`);

      // Attempt fallback to local MongoDB if primary was Atlas and local URI is different
      if (primaryUri !== DEFAULT_LOCAL_URI) {
        console.log('🔄 Attempting fallback connection to local MongoDB (mongodb://127.0.0.1:27017/rojgar)...');
        try {
          await mongoose.disconnect();
          const fallbackConn = await mongoose.connect(DEFAULT_LOCAL_URI, {
            serverSelectionTimeoutMS: 3000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10
          });
          isConnected = true;
          console.log(`✅ Local MongoDB Fallback Connected: ${fallbackConn.connection.host}`);
          return fallbackConn;
        } catch (fallbackError) {
          console.error('❌ Local MongoDB Fallback failed (Local MongoDB service is not running):', fallbackError.message);
        }
      }

      // Output diagnostic steps for Atlas IP Whitelisting
      if (primaryUri.includes('mongodb+srv') || primaryError.name === 'MongooseServerSelectionError') {
        console.log('\n===================================================================');
        console.log('⚠️  MONGODB ATLAS IP WHITELIST ACTION REQUIRED');
        console.log('===================================================================');
        console.log('Your connection attempt to MongoDB Atlas was rejected.');
        console.log('Common Reason: Your current IP address is not whitelisted in Atlas Network Access.');
        console.log('\nSteps to resolve:');
        console.log('1. Log in to https://cloud.mongodb.com');
        console.log('2. Navigate to: Security -> Network Access');
        console.log('3. Click "+ Add IP Address"');
        console.log('4. Click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0) or add your current IP address.');
        console.log('5. Save and wait ~1 minute for Atlas firewall rules to update.');
        console.log('===================================================================\n');
      }

      isConnected = false;
      throw primaryError;
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
};

mongoose.connection.on('disconnected', () => {
  if (isConnected) {
    console.warn('⚠️ MongoDB disconnected! Driver attempting background reconnection...');
    isConnected = false;
  }
});

mongoose.connection.on('error', (err) => {
  if (mongoose.connection.readyState === 1) {
    console.error('MongoDB runtime error:', err.message);
  }
});

module.exports = connectDB;

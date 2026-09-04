const app = require('./app');
const connectDB = require('./config/database');

const PORT = parseInt(process.env.PORT, 10) || 5000;

// Connect to MongoDB and start listening
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ROJGAR Backend Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Initial MongoDB Connection Error:', err);
    app.listen(PORT, () => {
      console.log(`ROJGAR Backend Server started on port ${PORT} (retrying database connection)`);
    });
  });

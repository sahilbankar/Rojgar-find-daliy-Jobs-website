const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      trim: true,
      lowercase: true
    },
    message: {
      type: String,
      required: [true, 'Please enter your message'],
      trim: true
    },
    status: {
      type: String,
      enum: ['New', 'Read', 'Replied'],
      default: 'New'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);

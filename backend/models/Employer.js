const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyDescription: {
      type: String,
    },
    website: {
      type: String,
    },
    location: {
      type: String, // E.g., City, State
    },
    address: {
      type: String, // Full street address
    },
    phone: {
      type: String,
    },
    logoUrl: {
      type: String,
    },
    logoPublicId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employer', employerSchema);

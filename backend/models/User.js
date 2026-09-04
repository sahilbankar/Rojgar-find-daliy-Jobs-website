const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['jobseeker', 'employer', 'admin'],
      default: 'jobseeker',
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
    },
    resumePublicId: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    avatarPublicId: {
      type: String,
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Actively Looking', 'Not Looking'],
      default: 'Actively Looking'
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
    },
    location: {
      type: String,
    },
    education: {
      type: String,
    },
    experience: {
      type: String, // E.g., '3 years'
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
      }
    ],
    refreshTokens: [
      {
        token: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

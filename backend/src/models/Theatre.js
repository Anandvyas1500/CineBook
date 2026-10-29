const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    location: {
      type: String, // landmark or area e.g. "Phoenix Marketcity, Kurla"
      default: ''
    },
    amenities: {
      type: [String],
      default: ['Dolby Atmos', 'Recliner Seats', 'F&B Service', 'Parking']
    },
    screensCount: {
      type: Number,
      default: 3
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

theatreSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = `${this.name}-${this.city}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Theatre', theatreSchema);

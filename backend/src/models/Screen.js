const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true
    },
    screenNumber: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true,
      default: 'Screen 1'
    },
    soundSystem: {
      type: String,
      default: 'Dolby Atmos 7.1'
    },
    screenType: {
      type: String,
      enum: ['Standard', 'IMAX', '4DX', 'Dolby Cinema', 'Laser 4K'],
      default: 'Standard'
    },
    totalSeats: {
      type: Number,
      default: 120
    },
    layout: {
      tiers: [
        {
          name: {
            type: String,
            enum: ['Classic', 'Premium', 'VIP'],
            required: true
          },
          rows: [String], // e.g. ['A', 'B']
          seatsPerRow: { type: Number, default: 12 }
        }
      ],
      aisles: {
        type: [Number],
        default: [3, 9] // after seat 3 and seat 9
      }
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

module.exports = mongoose.model('Screen', screenSchema);

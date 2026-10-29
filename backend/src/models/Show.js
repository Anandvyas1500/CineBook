const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true
    },
    showDate: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true
    },
    showTime: {
      type: String, // '10:30 AM', '02:15 PM', etc.
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    format: {
      type: String,
      default: '2D'
    },
    language: {
      type: String,
      default: 'English'
    },
    pricing: {
      classic: {
        type: Number,
        required: true,
        default: 180
      },
      premium: {
        type: Number,
        required: true,
        default: 280
      },
      vip: {
        type: Number,
        required: true,
        default: 450
      }
    },
    occupiedSeats: {
      type: [String], // Array of seat codes like ['A1', 'A2', 'B5', 'F10']
      default: [],
      index: true
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

// Compound index for querying shows by movie, theatre, date
showSchema.index({ movie: 1, showDate: 1, theatre: 1 });

module.exports = mongoose.model('Show', showSchema);

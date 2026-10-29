const mongoose = require('mongoose');

const bookingSeatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true
    },
    tier: {
      type: String,
      required: true,
      enum: ['Classic', 'Premium', 'VIP']
    },
    price: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true
    },
    movieSnapshot: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
      title: String,
      posterUrl: String,
      certificate: String,
      format: String,
      language: String
    },
    theatreSnapshot: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
      name: String,
      city: String,
      location: String,
      screenName: String
    },
    showSnapshot: {
      showDate: String,
      showTime: String,
      startTime: Date
    },
    seats: [bookingSeatSchema],
    seatCount: {
      type: Number,
      default: function () {
        return this.seats ? this.seats.length : 0;
      }
    },
    baseAmount: {
      type: Number,
      required: true
    },
    convenienceFee: {
      type: Number,
      required: true
    },
    taxAmount: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    bookingStatus: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED'],
      default: 'CONFIRMED'
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PAID'
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    cancelledAt: {
      type: Date
    },
    qrCodeData: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Booking', bookingSchema);

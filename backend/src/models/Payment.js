const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    method: {
      type: String,
      enum: ['DEMO_CARD', 'DEMO_UPI', 'DEMO_NETBANKING', 'DEMO_WALLET'],
      default: 'DEMO_UPI'
    },
    provider: {
      type: String,
      default: 'DEMO_GATEWAY'
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'],
      default: 'SUCCESS'
    },
    isDemo: {
      type: Boolean,
      default: true,
      required: true
    },
    paymentMetadata: {
      mode: { type: String, default: 'SIMULATION' },
      gatewayNote: {
        type: String,
        default: 'CineBook Simulated Payment - No real financial transaction occurred'
      }
    },
    paidAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);

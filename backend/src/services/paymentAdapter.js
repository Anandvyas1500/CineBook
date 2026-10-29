const { AppError } = require('../middleware/errorMiddleware');

const SENSITIVE_KEYS = ['cardnumber', 'card', 'cvv', 'cvc', 'pin', 'upipin', 'password', 'expiry'];

/**
 * Deep-scans an object for keys that look like payment credentials.
 * CineBook never accepts or stores these.
 */
const containsSensitiveKeys = (obj, depth = 0) => {
  if (!obj || typeof obj !== 'object' || depth > 4) return false;
  return Object.keys(obj).some(
    (key) => SENSITIVE_KEYS.includes(key.toLowerCase()) || containsSensitiveKeys(obj[key], depth + 1)
  );
};

class PaymentAdapter {
  async processPayment() {
    throw new Error('processPayment must be implemented by payment adapter');
  }

  async refundPayment() {
    throw new Error('refundPayment must be implemented by payment adapter');
  }
}

/**
 * DemoPaymentAdapter provides a realistic payment simulation for local testing.
 * It strictly refuses to receive sensitive credentials (card numbers, CVV, PIN).
 */
class DemoPaymentAdapter extends PaymentAdapter {
  constructor() {
    super();
    this.name = 'DEMO_PAYMENT_GATEWAY';
  }

  async processPayment({ amount, currency = 'INR', method = 'DEMO_UPI', metadata = {} }) {
    if (containsSensitiveKeys(metadata)) {
      throw new AppError(
        'Security violation: sensitive financial credentials (card number, CVV, PIN) must never be sent.',
        400
      );
    }

    if (metadata.simulateFailure === true) {
      return {
        success: false,
        status: 'FAILED',
        isDemo: true,
        provider: this.name,
        error: 'Payment declined by simulated bank.'
      };
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const transactionId = `TXN_DEMO_${Date.now()}_${randomSuffix}`;

    return {
      success: true,
      status: 'SUCCESS',
      isDemo: true,
      provider: this.name,
      transactionId,
      amount,
      currency,
      method,
      paidAt: new Date(),
      note: 'Demo payment simulated successfully. No real money was charged.'
    };
  }

  async refundPayment({ transactionId, amount }) {
    return {
      success: true,
      status: 'REFUNDED',
      isDemo: true,
      refundId: `REF_DEMO_${Date.now()}`,
      originalTransactionId: transactionId,
      refundedAmount: amount,
      refundedAt: new Date()
    };
  }
}

// Only the demo gateway exists today; plug a real provider in here later.
const getPaymentAdapter = () => new DemoPaymentAdapter();

module.exports = {
  PaymentAdapter,
  DemoPaymentAdapter,
  getPaymentAdapter,
  containsSensitiveKeys
};

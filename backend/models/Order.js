const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // Relation Many-to-1 avec User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    // Relation 1-to-Many avec OrderItem
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem'
      }
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    shippingAddress: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer'],
      default: 'credit_card'
    },
    isPaid: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);

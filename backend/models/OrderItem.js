const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    // Relation Many-to-1 avec Order
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    // Relation Many-to-1 avec Product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrderItem', orderItemSchema);

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    image: {
      type: String,
      default: null
    },
    brand: {
      type: String,
      default: null
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    // Relation Many-to-Many avec Category
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    // Relation 1-to-Many avec Review
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // Relation Many-to-1 avec Product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required']
    },
    // Relation Many-to-1 avec User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: '',
      maxlength: 1000
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);

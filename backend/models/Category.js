const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: null
    },
    // Relation Many-to-Many avec Product (gérée depuis Product)
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);

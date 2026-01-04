const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false // Ne retourne pas le mot de passe par défaut
    },
    phone: {
      type: String,
      default: null
    },
    address: {
      type: String,
      default: null
    },
    // Adresses multiples
    addresses: [
      {
        label: { type: String, required: true }, // ex: "Maison", "Travail"
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'Tunisie' },
        phone: { type: String },
        isDefault: { type: Boolean, default: false }
      }
    ],
    // Relation 1-to-1 avec Profile
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      unique: true
    },
    // Relation 1-to-Many avec Order
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    ],
    // Relation Many-to-Many avec Product (Wishlist)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  { timestamps: true }
);

// Middleware : Hasher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  // Si le mot de passe n'a pas été modifié, on continue
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hasher avec 10 rounds (comme dans MERN1-6)
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode : Comparer les mots de passe
userSchema.methods.comparePassword = async function(plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

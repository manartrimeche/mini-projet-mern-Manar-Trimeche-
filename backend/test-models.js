require('dotenv').config();
const mongoose = require('mongoose');

// Importe tous les modèles
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('✅ Modèles chargés avec succès !');
  console.log('📊 Modèles disponibles :');
  console.log('   - User');
  console.log('   - Profile');
  console.log('   - Product');
  console.log('   - Category');
  console.log('   - Review');
  console.log('   - Order');
  console.log('   - OrderItem');
  process.exit(0);
}).catch(err => {
  console.error('  Erreur :', err.message);
  process.exit(1);
});

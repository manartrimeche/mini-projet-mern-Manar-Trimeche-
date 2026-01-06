const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const User = require('../models/User');
const Profile = require('../models/Profile');

// DESC: Créer une commande
// ROUTE: POST /api/orders
// ACCESS: Private
exports.createOrder = async (req, res) => {
  try {
    console.log('Création de commande...');
    console.log('Body reçu:', req.body);
    console.log('UserId:', req.userId);
    
    const { items, shippingAddress, paymentMethod, discountPointsToUse } = req.body;
    const userId = req.userId; // Depuis le middleware protect

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La commande doit contenir au moins un produit'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'L\'adresse de livraison est requise'
      });
    }

    let totalPrice = 0;
    const orderItems = [];

    // Vérifier les stocks avant de faire quoi que ce soit
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produit ${item.productId} non trouvé`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour ${product.name}`
        });
      }

      totalPrice += product.price * item.quantity;
    }

    // Vérifier et appliquer les points de réduction
    let discountPointsUsed = 0;
    let discountAmount = 0;

    if (discountPointsToUse && discountPointsToUse > 0) {
      const profile = await Profile.findOne({ user: userId });
      
      if (!profile || !profile.wallet || profile.wallet.discountPoints < discountPointsToUse) {
        return res.status(400).json({
          success: false,
          message: `Vous n\'avez pas assez de points de réduction. Disponibles: ${profile?.wallet?.discountPoints || 0}`,
          availablePoints: profile?.wallet?.discountPoints || 0
        });
      }

      // Conversion: 1 point = 1 TND
      discountAmount = discountPointsToUse * 1;
      
      // S'assurer que la réduction ne dépasse pas le prix total
      if (discountAmount > totalPrice) {
        discountAmount = totalPrice;
        discountPointsUsed = Math.floor(totalPrice / 1);
      } else {
        discountPointsUsed = discountPointsToUse;
      }

      // Soustraire les points du wallet de l'utilisateur
      profile.wallet.discountPoints -= discountPointsUsed;
      await profile.save();
    }

    // Appliquer la réduction au prix total
    totalPrice = Math.max(0, totalPrice - discountAmount);

    // Créer la commande d'abord
    const order = await Order.create({
      user: userId,
      items: [],
      totalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || 'credit_card',
      discountPointsUsed,
      discountAmount
    });

    // Ensuite créer les OrderItems avec la référence à la commande
    for (const item of items) {
      const product = await Product.findById(item.productId);

      const orderItem = await OrderItem.create({
        order: order._id,
        product: item.productId,
        quantity: item.quantity,
        price: product.price
      });

      orderItems.push(orderItem._id);

      // Réduire le stock du produit
      product.stock -= item.quantity;
      await product.save();
    }

    // Mettre à jour la commande avec les items
    order.items = orderItems;
    await order.save();

    // Ajouter la commande à l'utilisateur
    await User.findByIdAndUpdate(userId, {
      $push: { orders: order._id }
    });

    // Populate pour retourner les détails complets
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'items',
        populate: { path: 'product' }
      })
      .populate('user', 'username email');

    res.status(201).json({
      success: true,
      message: '✅ Commande créée avec succès',
      data: populatedOrder
    });
  } catch (error) {
    console.error('  Erreur createOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message
    });
  }
};

// DESC: Récupérer toutes les commandes de l'utilisateur
// ROUTE: GET /api/orders
// ACCESS: Private
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ user: userId })
      .populate({
        path: 'items',
        populate: { path: 'product', select: 'name price image' }
      })
      .sort({ createdAt: -1 }); // Plus récentes en premier

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes',
      error: error.message
    });
  }
};

// DESC: Récupérer une commande par ID
// ROUTE: GET /api/orders/:id
// ACCESS: Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items',
        populate: { path: 'product' }
      })
      .populate('user', 'username email phone address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier que l'utilisateur est propriétaire de la commande
    if (order.user._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande',
      error: error.message
    });
  }
};

// DESC: Mettre à jour le statut d'une commande
// ROUTE: PUT /api/orders/:id/status
// ACCESS: Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Valider le statut
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items').populate('user', 'username email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Statut de la commande mis à jour',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// DESC: Marquer une commande comme payée
// ROUTE: PUT /api/orders/:id/pay
// ACCESS: Private
exports.markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    order.isPaid = true;
    order.status = 'processing';
    await order.save();

    res.status(200).json({
      success: true,
      message: '✅ Paiement marqué comme effectué',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du paiement',
      error: error.message
    });
  }
};

// DESC: Supprimer une commande
// ROUTE: DELETE /api/orders/:id
// ACCESS: Private
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier l'accès
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Supprimer les OrderItems
    await OrderItem.deleteMany({ _id: { $in: order.items } });

    // Supprimer la commande
    await Order.findByIdAndDelete(req.params.id);

    // Retirer de l'utilisateur
    await User.findByIdAndUpdate(req.userId, {
      $pull: { orders: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: '✅ Commande supprimée'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// DESC: Récupérer tous les OrderItems d'une commande
// ROUTE: GET /api/orders/:id/items
// ACCESS: Private
exports.getOrderItems = async (req, res) => {
  try {
    const items = await OrderItem.find({ order: req.params.id })
      .populate('product')
      .populate('order');

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des articles',
      error: error.message
    });
  }
};

// DESC: Récupérer les points de réduction disponibles
// ROUTE: GET /api/orders/discount-points
// ACCESS: Private
exports.getAvailableDiscountPoints = async (req, res) => {
  try {
    const userId = req.userId;

    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profil utilisateur non trouvé'
      });
    }

    const availablePoints = profile.wallet?.discountPoints || 0;
    const discountRate = 1; // 1 point = 1 TND
    const maxDiscount = availablePoints * discountRate;

    res.status(200).json({
      success: true,
      data: {
        availablePoints,
        discountRate,
        maxDiscount: parseFloat(maxDiscount.toFixed(2))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des points',
      error: error.message
    });
  }
};

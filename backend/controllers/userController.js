const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');

// DESC: Récupérer tous les utilisateurs
// ROUTE: GET /api/users
// ACCESS: Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password') // Exclure les mots de passe
      .populate('profile')
      .populate('orders');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// DESC: Récupérer un utilisateur par ID
// ROUTE: GET /api/users/:id
// ACCESS: Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('profile')
      .populate('orders')
      .populate('wishlist');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

// DESC: Mettre à jour un utilisateur
// ROUTE: PUT /api/users/:id
// ACCESS: Private (L'utilisateur lui-même ou Admin)
exports.updateUser = async (req, res) => {
  try {
    // Empêcher de mettre à jour le password ici
    const { password, ...updateData } = req.body;

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Mettre à jour
    user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// DESC: Supprimer un utilisateur
// ROUTE: DELETE /api/users/:id
// ACCESS: Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Supprimer aussi le profil associé
    await Profile.deleteOne({ user: user._id });

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// DESC: Ajouter un produit à la wishlist
// ROUTE: POST /api/users/:id/wishlist/:productId
// ACCESS: Private
exports.addToWishlist = async (req, res) => {
  try {
    const { id, productId } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si le produit est déjà dans la wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Ce produit est déjà dans votre wishlist'
      });
    }

    // Ajouter le produit
    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: '✅ Produit ajouté à la wishlist',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout à la wishlist',
      error: error.message
    });
  }
};

// DESC: Supprimer un produit de la wishlist
// ROUTE: DELETE /api/users/:id/wishlist/:productId
// ACCESS: Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { id, productId } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Supprimer le produit de la wishlist
    user.wishlist = user.wishlist.filter(item => item.toString() !== productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: '✅ Produit supprimé de la wishlist',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la wishlist',
      error: error.message
    });
  }
};

// DESC: Mettre à jour le profil de l'utilisateur connecté
// ROUTE: PUT /api/users/profile
// ACCESS: Private
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Mettre à jour username et email
    if (username) user.username = username;
    if (email) user.email = email;

    // Si changement de mot de passe
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel requis'
        });
      }

      // Vérifier le mot de passe actuel
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }

      // Hash le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // Retourner l'utilisateur sans le mot de passe
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

// DESC: Ajouter une adresse
// ROUTE: POST /api/users/addresses
// ACCESS: Private
exports.addAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { label, street, city, postalCode, country, phone, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Si c'est la première adresse, la mettre par défaut
    const setAsDefault = user.addresses.length === 0 || isDefault;

    // Si nouvelle adresse par défaut, retirer le défaut des autres
    if (setAsDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      label,
      street,
      city,
      postalCode,
      country: country || 'Tunisie',
      phone,
      isDefault: setAsDefault
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Adresse ajoutée avec succès',
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'adresse',
      error: error.message
    });
  }
};

// DESC: Mettre à jour une adresse
// ROUTE: PUT /api/users/addresses/:addressId
// ACCESS: Private
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Adresse non trouvée'
      });
    }

    // Si mise à jour pour définir par défaut
    if (updateData.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    Object.assign(address, updateData);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Adresse mise à jour avec succès',
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'adresse',
      error: error.message
    });
  }
};

// DESC: Supprimer une adresse
// ROUTE: DELETE /api/users/addresses/:addressId
// ACCESS: Private
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    user.addresses.pull(addressId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Adresse supprimée avec succès',
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'adresse',
      error: error.message
    });
  }
};

// DESC: Récupérer les adresses de l'utilisateur connecté
// ROUTE: GET /api/users/addresses
// ACCESS: Private
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      count: user.addresses.length,
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des adresses',
      error: error.message
    });
  }
};

// DESC: Récupérer la wishlist d'un utilisateur
// ROUTE: GET /api/users/:id/wishlist
// ACCESS: Private
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('wishlist');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      count: user.wishlist.length,
      data: user.wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la wishlist',
      error: error.message
    });
  }
};

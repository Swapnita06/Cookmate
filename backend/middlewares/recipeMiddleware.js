const mongoose = require('mongoose');
const Recipe = require('../models/Receipes');

// Validate recipe ID
const validateRecipeId = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid recipe ID' });
  }
  next();
};

// Check recipe ownership
const checkRecipeOwnership = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this recipe' });
    }

    req.recipe = recipe;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  validateRecipeId,
  checkRecipeOwnership,
};

const Recipe = require('../models/Receipes.js');
const mongoose = require('mongoose');

const createRecipe = async (req, res) => {
  try {
    console.log('Authenticated user:', req.user); // Debug log
    
    if (!req.user?._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const recipe = new Recipe({
      ...req.body,
      _id: new mongoose.Types.ObjectId(),
      createdBy: req.user._id // Set from authenticated user
    });

    const savedRecipe = await recipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error('Recipe creation error:', error);
    res.status(500).json({ 
      message: "Error creating recipe",
      error: error.message 
    });
  }
};
// Get all recipes
const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('createdBy', 'name email');
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes', error });
  }
};

// Get single recipe
const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'name email');
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipe', error });
  }
};

// Update recipe
const updateRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, image, steps } = req.body;
    
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { title, description, ingredients, image, steps, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.status(200).json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ message: 'Error updating recipe', error });
  }
};

// Delete recipe
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recipe', error });
  }
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipe,
  updateRecipe,
  deleteRecipe
};
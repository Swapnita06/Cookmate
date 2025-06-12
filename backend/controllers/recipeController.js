const Recipe = require('../models/Receipes.js');
const mongoose = require('mongoose');
const User = require('../models/User');
const Comment = require('../models/Comment.js');





const createRecipe = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    console.log('Authenticated user:', req.user); // Debug log
    
    if (!req.user?._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // 1. Create the recipe
    const recipe = new Recipe({
      ...req.body,
      _id: new mongoose.Types.ObjectId(),
      createdBy: req.user._id
    });

    const savedRecipe = await recipe.save({ session });

    // 2. Update the user's createdRecipes array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { createdRecipes: savedRecipe._id } },
      { session, new: true }
    );

    await session.commitTransaction();
    res.status(201).json(savedRecipe);
  } catch (error) {
    await session.abortTransaction();
    console.error('Recipe creation error:', error);
    res.status(500).json({ 
      message: "Error creating recipe",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};



const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('createdBy', 'name email')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes', error });
  }
};


// Get single recipe




// const getRecipe = async (req, res) => {
//   try {
//     const recipe = await Recipe.findById(req.params.id)
//     .populate('createdBy', 'name email image')
//     if (!recipe) {
//       return res.status(404).json({ message: 'Recipe not found' });
//     }
//     res.status(200).json(recipe);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching recipe', error:error.message });
//   }
// };


const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('createdBy', 'name email image')
.populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('likes', 'name email')
      
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipe', error: error.message });
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


// Like a recipe
const likeRecipe = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const recipe = await Recipe.findById(req.params.id).session(session);
    if (!recipe) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already liked the recipe
    const alreadyLiked = recipe.likes.includes(req.user._id);
    
    if (alreadyLiked) {
      // Unlike the recipe
      recipe.likes.pull(req.user._id);
      user.favRecipes.pull(recipe._id);
    } else {
      // Like the recipe - Add duplicate check here
      if (!user.favRecipes.includes(recipe._id)) {
        user.favRecipes.push(recipe._id);
      }
      recipe.likes.push(req.user._id);
    }

    await recipe.save({ session });
    await user.save({ session });
    await session.commitTransaction();
    
    return res.status(200).json({ 
      message: alreadyLiked ? 'Recipe unliked successfully' : 'Recipe liked successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in likeRecipe:', error);
    res.status(500).json({ message: 'Error liking recipe', error: error.message });
  } finally {
    session.endSession();
  }
};

// Add comment to recipe
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // 1. Create comment document
    const comment = new Comment({
      user: req.user._id,
      text
    });

    // 2. Save to DB
    await comment.save();

    // 3. Add comment _id to recipe
    recipe.comments.push(comment._id);
    await recipe.save();

    // 4. Populate user info in the response
   // await comment.populate('user', 'name email');
const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email')
      .lean();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error });
  }
};

// Save recipe to user's saved recipes
const saveRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if recipe is already saved
    const alreadySaved = user.savedRecipes.includes(recipe._id);
    
    if (alreadySaved) {
      // Remove from saved recipes
      user.savedRecipes.pull(recipe._id);
      recipe.savedBy.pull(user._id);
      await user.save();
      await recipe.save();
      return res.status(200).json({ message: 'Recipe removed from saved recipes' });
    } else {
      // Add to saved recipes
      user.savedRecipes.push(recipe._id);
      recipe.savedBy.push(user._id);
      await user.save();
         await recipe.save();
      return res.status(200).json({ message: 'Recipe saved successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving recipe', error });
  }
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  likeRecipe,
  addComment,
  saveRecipe
};
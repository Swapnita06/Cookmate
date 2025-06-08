const express = require('express');
const router = express.Router();

// Import controllers
const recipeController = require('../controllers/recipeController');

// Import middlewares
const recipeMiddleware = require('../middlewares/recipeMiddleware');
const checkAuth = require('../middlewares/checkAuth');

// Public routes
router.get('/getallrecipes', recipeController.getAllRecipes);
router.get('/:id', recipeMiddleware.validateRecipeId, recipeController.getRecipe);

// Protected routes
router.post('/create', 
  checkAuth, // Make sure this is a valid function
  recipeController.createRecipe
);

router.put('/update/:id', 
  checkAuth,
  recipeMiddleware.validateRecipeId, 
  recipeMiddleware.checkRecipeOwnership, 
  recipeController.updateRecipe
);

router.delete('/delete/:id', 
  checkAuth,
  recipeMiddleware.validateRecipeId, 
  recipeMiddleware.checkRecipeOwnership, 
  recipeController.deleteRecipe
);

router.post('/:id/like', checkAuth, recipeController.likeRecipe);
router.post('/:id/comments', checkAuth, recipeController.addComment);
router.post('/:id/save',checkAuth, recipeController.saveRecipe);

module.exports = router;
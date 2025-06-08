"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllRecipes, likeRecipe, saveRecipe, addComment } from '../services/recipeService';
import { Recipe } from '../component/types/recipe';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

const RecipeListPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getAllRecipes();
        setRecipes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleLike = async (recipeId: string) => {
    if (!isAuthenticated || !user || !token) {
      router.push('/login');
      return;
    }
    try {
      await likeRecipe(recipeId, token);
      setRecipes(recipes.map(recipe => {
        if (recipe._id === recipeId) {
          const isLiked = recipe.likes.includes(user._id);
          return {
            ...recipe,
            likes: isLiked 
              ? recipe.likes.filter(id => id !== user._id)
              : [...recipe.likes, user._id]
          };
        }
        return recipe;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like recipe');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        logout();
        router.push('/login');
      }
    }
  };

  const handleSave = async (recipeId: string) => {
    if (!isAuthenticated || !user || !token) {
      router.push('/login');
      return;
    }
    try {
      await saveRecipe(recipeId, token);
      alert('Recipe saved to your collection!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        logout();
        router.push('/login');
      }
    }
  };

  const handleCommentChange = (recipeId: string, text: string) => {
    setCommentTexts(prev => ({ ...prev, [recipeId]: text }));
  };

 const handleCommentSubmit = async (recipeId: string) => {
  if (!isAuthenticated || !user || !token) {
    router.push('/login');
    return;
  }
  const text = commentTexts[recipeId] || '';
  if (!text.trim()) return;

  try {
    const newComment = await addComment(recipeId, text, token);
    setRecipes(recipes.map(recipe => {
      if (recipe._id === recipeId) {
        return {
          ...recipe,
          comments: [...recipe.comments, {
            ...newComment,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email
            }
          }]
           //comments: [...recipe.comments, newComment]
        };
      }
      return recipe;
    }));
    setCommentTexts(prev => ({ ...prev, [recipeId]: '' }));
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to add comment');
    if (err instanceof Error && err.message.includes('Unauthorized')) {
      logout();
      router.push('/login');
    }
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">All Recipes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <div key={recipe._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {recipe.image && (
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-48 object-cover"
              />
            )}
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Link href={`/recipes/${recipe._id}`} className="text-xl font-semibold hover:text-blue-600">
                  {recipe.title}
                </Link>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleLike(recipe._id)}
                    className={`p-1 rounded-full ${user && recipe.likes.includes(user._id) ? 'text-red-500' : 'text-gray-400'}`}
                    aria-label="Like"
                  >
                    ♥ {recipe.likes.length}
                  </button>
                  <button 
                    onClick={() => handleSave(recipe._id)}
                    className="p-1 text-gray-600 hover:text-blue-600"
                    aria-label="Save"
                  >
                    📖
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">{recipe.description}</p>
              
              <div className="mb-3">
                <h3 className="font-medium mb-1">Ingredients:</h3>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                    <li key={`${recipe._id}-ingredient-${index}`}>{ingredient}</li>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <li key={`${recipe._id}-more-ingredients`}>
                      ...and {recipe.ingredients.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                <span>By {recipe.createdBy.name}</span>
                <span className="mx-2">•</span>
                <span>
                  {isNaN(Date.parse(recipe.createdAt)) 
                    ? new Date().toLocaleDateString() 
                    : new Date(recipe.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Comments ({recipe.comments.length})</h4>
                
               <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
  {recipe.comments.map((comment) => (
    <div 
      key={`comment-${comment._id}`}
      className="text-sm"
    >
      <span className="font-semibold">
        {comment.user?.name || 'Anonymous'}: 
      </span>
      <span> {comment.text}</span>
    </div>
  ))}
</div>

{/* <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
  {recipe.comments.map((comment) => {
    // Skip rendering if comment is just an ID string
    if (typeof comment === 'string') return null;
    
    return (
      <div 
        key={`comment-${comment._id}`}
        className="text-sm"
      >
        <span className="font-semibold">
          {comment.user?.name || 'Anonymous'}: 
        </span>
        <span> {comment.text}</span>
      </div>
    );
  })}
</div> */}
                
                <div className="flex">
                  <input
                    type="text"
                    value={commentTexts[recipe._id] || ''}
                    onChange={(e) => handleCommentChange(recipe._id, e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 border rounded-l px-3 py-1 text-sm"
                  />
                  <button
                    onClick={() => handleCommentSubmit(recipe._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-r text-sm hover:bg-blue-600"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeListPage;
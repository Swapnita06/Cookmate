// services/recipeService.ts
import { Recipe, Comment } from '../component/types/recipe';

const API_BASE_URL = 'http://localhost:3000/api/receipe';

// Helper function to safely parse dates
const safeDateParse = (dateString: string | Date): string => {
  if (!dateString) return new Date().toISOString();
  if (dateString instanceof Date) return dateString.toISOString();
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch {
    return new Date().toISOString();
  }
};
///getallrecipes
// export const getAllRecipes = async (): Promise<Recipe[]> => {
//   const response = await fetch(`${API_BASE_URL}/getallrecipes`);
//   if (!response.ok) {
//     throw new Error('Failed to fetch recipes');
//   }
  
//   const data = await response.json();
  
//   return data.map((recipe: any) => ({
//     ...recipe,
//     createdAt: safeDateParse(recipe.createdAt),
//     updatedAt: safeDateParse(recipe.updatedAt),
//     comments: recipe.comments?.map((comment: any) => ({
//       ...comment,
//       createdAt: safeDateParse(comment.createdAt),
//       user: {
//         _id: comment.user?._id || '',
//         name: comment.user?.name || 'Unknown',
//         email: comment.user?.email || ''
//       }
//     })) || []
//   })) as Recipe[];
// };


// services/recipeService.ts
export const getAllRecipes = async (): Promise<Recipe[]> => {
  const response = await fetch(`${API_BASE_URL}/getallrecipes`);
  if (!response.ok) {
    throw new Error('Failed to fetch recipes');
  }
  
  const data = await response.json();
  
  return data.map((recipe: any) => ({
    ...recipe,
    createdAt: safeDateParse(recipe.createdAt),
    updatedAt: safeDateParse(recipe.updatedAt),
    comments: recipe.comments?.map((comment: any) => ({
      ...comment,
      _id: comment._id || '',
      text: comment.text || '',
      createdAt: safeDateParse(comment.createdAt),
      user: {
        _id: comment.user?._id || '',
        name: comment.user?.name || 'Unknown',
        email: comment.user?.email || ''
      }
    })) || []
  })) as Recipe[];
};



// export const getAllRecipes = async (): Promise<Recipe[]> => {
//   const response = await fetch(`${API_BASE_URL}/getallrecipes`);
//   if (!response.ok) {
//     throw new Error('Failed to fetch recipes');
//   }
  
//   const data = await response.json();
  
//   return data.map((recipe: any) => ({
//     ...recipe,
//     createdAt: safeDateParse(recipe.createdAt),
//     updatedAt: safeDateParse(recipe.updatedAt),
//     comments: recipe.comments?.map((comment: any) => {
//       // Ensure comment is an object (not just an ID string)
//       const commentObj = typeof comment === 'string' ? { _id: comment } : comment;
      
//       return {
//         _id: commentObj._id,
//         text: commentObj.text || '',
//         createdAt: safeDateParse(commentObj.createdAt),
//         user: {
//           _id: commentObj.user?._id || '',
//           name: commentObj.user?.name || 'Unknown',
//           email: commentObj.user?.email || ''
//         }
//       };
//     }) || []
//   })) as Recipe[];
// };

export const likeRecipe = async (recipeId: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${recipeId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json() as { message?: string };
    throw new Error(errorData.message || 'Failed to like recipe');
  }
};

export const saveRecipe = async (recipeId: string, token: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/${recipeId}/save`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json() as { message?: string };
    throw new Error(errorData.message || 'Failed to save recipe');
  }
   return await response.json();
};

export const addComment = async (recipeId: string, text: string, token: string): Promise<Comment> => {
  const response = await fetch(`${API_BASE_URL}/${recipeId}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    const errorData = await response.json() as { message?: string };
    throw new Error(errorData.message || 'Failed to add comment');
  }

  const commentData = await response.json();
  
  return {
    ...commentData,
    _id: commentData._id || '',
    text: commentData.text || '',
    createdAt: safeDateParse(commentData.createdAt),
    user: {
      _id: commentData.user?._id || '',
      name: commentData.user?.name || 'Unknown',
      email: commentData.user?.email || ''
    }
  } as Comment;
};
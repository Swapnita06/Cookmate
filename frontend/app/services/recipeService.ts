import type { User,Recipe, Comment, ApiRecipe, ApiComment, ApiUser } from "../component/types/recipe";

const API_BASE_URL = "https://cookmate-1-v0vt.onrender.com/api/receipe";

// Helper function to safely parse dates
const safeDateParse = (dateString: string | Date | undefined): string => {
  if (!dateString) return new Date().toISOString();
  if (dateString instanceof Date) return dateString.toISOString();

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

// Transform API user to frontend user type
const transformUser = (user: ApiUser | string | undefined): User | string => {
  if (typeof user === 'string') return user;
  if (!user) return 'Unknown';
  
  return {
    _id: user._id,
    name: user.name || 'Unknown',
    email: user.email || '',
    image: user.image
  };
};

// Transform API comment to frontend comment type
const transformComment = (comment: ApiComment): Comment => {
  return {
    _id: comment._id || '',
    text: comment.text || '',
    createdAt: safeDateParse(comment.createdAt),
    user: comment.user ? transformUser(comment.user) : 'Unknown'
  };
};

// Transform API recipe to frontend recipe type
const transformRecipe = (recipe: ApiRecipe): Recipe => {
  return {
    ...recipe,
    createdAt: safeDateParse(recipe.createdAt),
    updatedAt: safeDateParse(recipe.updatedAt),
    likes: recipe.likes?.map(like => transformUser(like)) || [],
    comments: recipe.comments?.map(transformComment) || [],
    createdBy: recipe.createdBy ? transformUser(recipe.createdBy) : 'Unknown'
  };
};

export const getAllRecipes = async (): Promise<Recipe[]> => {
  const response = await fetch(`${API_BASE_URL}/getallrecipes`);
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }

  const data: ApiRecipe[] = await response.json();
  return data.map(transformRecipe);
};

export const likeRecipe = async (recipeId: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${recipeId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json() as { message?: string };
    throw new Error(errorData.message || "Failed to like recipe");
  }
};

export const saveRecipe = async (recipeId: string, token: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/${recipeId}/save`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json() as { message?: string };
    throw new Error(errorData.message || "Failed to save recipe");
  }
  return await response.json();
};

export const addComment = async (recipeId: string, text: string, token: string): Promise<Comment> => {
  const response = await fetch(`${API_BASE_URL}/${recipeId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json() as { message?: string };
    throw new Error(errorData.message || "Failed to add comment");
  }

  const commentData: ApiComment = await response.json();
  return transformComment(commentData);
};

export const getRecipe = async (id: string, token?: string): Promise<Recipe> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: token ? { 
      Authorization: `Bearer ${token}`, 
      "Content-Type": "application/json" 
    } : {},
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recipe");
  }

  const recipeData: ApiRecipe = await response.json();
  return transformRecipe(recipeData);
};
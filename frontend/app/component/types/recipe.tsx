export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  savedRecipes?: string[];
  createdRecipes?: string[];
  favRecipes?: string[];
}

export interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  user: User | string;
}

export interface RecipeStep {
  _id?: string;
  stepNumber: number;
  instruction: string;
  time: number;
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  image?: string;
  ingredients: string[];
  steps: RecipeStep[];
  likes: (User | string)[];
  comments: Comment[];
  savedBy?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: User | string;
}

// API Response Types
export interface ApiUser {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface ApiComment {
  _id?: string;
  text?: string;
  createdAt?: string | Date;
  user?: ApiUser | string;
}

export interface ApiRecipe {
  _id: string;
  title: string;
  description: string;
  image?: string;
  ingredients: string[];
  steps: RecipeStep[];
  likes?: (ApiUser | string)[];
  comments?: ApiComment[];
  savedBy?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: ApiUser | string;
}
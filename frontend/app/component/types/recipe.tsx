// types/recipe.ts
export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  time: number;
   _id?: string;
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: RecipeStep[];
  image?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  likes: string[];
  comments: Comment[];
}
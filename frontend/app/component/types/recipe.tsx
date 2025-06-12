// types/recipe.ts
export interface User {
  _id: string;
  name: string;
  email: string;
    image?: string;
}

export interface Comment {
  _id: string;
  user: User;
   name: string;
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
   createdBy: User ; 
  updatedAt: string;
  //likes string[];
  likes: User[]; 
  comments: Comment[];
  savedBy?: string[];
}
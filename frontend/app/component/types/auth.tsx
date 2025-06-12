// types/auth.ts
export interface Step {
  stepNumber: number;
  instruction: string;
  time: number;
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string[];
  image?: string;
  steps: Step[];
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  likes: User[] // Changed from string to User[]
  comments: Comment[]
  savedBy?: string[]
}

export interface Comment {
  _id: string
  user: User
  text: string
  createdAt: string
}

export interface User {
  _id: string;
  email: string;
  name: string;
   image?: string;
  savedRecipes: string[];
  createdRecipes: Recipe[];
  favRecipes: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  userId: string;
  email: string;
  name: string;
   image?: string;
}
// types/auth.ts
export interface User {
  _id: string;
  email: string;
  name: string;
  savedRecipes: string[];
  createdRecipes: string[];
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
}
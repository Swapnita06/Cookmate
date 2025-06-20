// services/api.ts
"use client"
import axios from 'axios';
import { AuthResponse, User } from '../component/types/auth';

const api = axios.create({
  baseURL: 'https://cookmate-1-v0vt.onrender.com'
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // For Next.js, we should check for window first
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const registerUser = async (data: {
  email: string;
  password: string;
  name: string;
}): Promise<{ data: AuthResponse }> => {
  return api.post('/api/users/register', data);
};

export const loginUser = async (data: { 
  email: string; 
  password: string 
}): Promise<{ data: AuthResponse }> => {
  return api.post('/api/users/login', data);
};

export const getUserProfile = async (): Promise<{ data: User }> => {
  return api.get('/api/users/get_profile');
};

export const updateUserProfile = async (data: { 
  name?: string; 
  email?: string 
}): Promise<{ data: User }> => {
  return api.put('/api/users/profile', data);
};

// Add new verification endpoints
// export const verifyEmail = async (data: { token: string }) => {
//   return api.get(`/users/verify-email?token=${data.token}`);
// };

export const verifyEmail = async (data: { token: string }) => {
  return axios.get(`https://cookmate-1-v0vt.onrender.com/api/users/verify-email?token=${data.token}`);
};

export const resendVerification = async (data: { userId: string }) => {
  return api.post('/users/resend-verification', data);
};

export default api;
"use client"
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerUser, loginUser } from '../services/api';
import toast from 'react-hot-toast';

// Form schemas
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  // Toggle between login/register
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  // Login Form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Register Form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Handle Login
  const onLogin = async (data: LoginFormData) => {
    try {
      const response = await loginUser(data);
      localStorage.setItem('token', response.data.token);
      toast.success('Logged in successfully!');
      router.push('/');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  // Handle Register
  const onRegister = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success('Account created successfully!');
      setIsLogin(true); // Switch to login after registration
      reset();
    } catch (error) {
      toast.error('Registration failed. Email may already exist.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
        {/* Auth Header */}
        <div className="bg-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
        </div>

        {/* Auth Form */}
        <div className="p-6">
          {isLogin ? (
            // Login Form
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  {...loginRegister('email')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    loginErrors.email ? 'border-red-500' : 'border'
                  }`}
                />
                {loginErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  {...loginRegister('password')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    loginErrors.password ? 'border-red-500' : 'border'
                  }`}
                />
                {loginErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoginSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoginSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          ) : (
            // Register Form
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  {...registerRegister('email')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    registerErrors.email ? 'border-red-500' : 'border'
                  }`}
                />
                {registerErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  {...registerRegister('password')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    registerErrors.password ? 'border-red-500' : 'border'
                  }`}
                />
                {registerErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.password.message}</p>
                )}
              </div>

  <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  {...registerRegister('name')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    registerErrors.name ? 'border-red-500' : 'border'
                  }`}
                />
                {registerErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.name.message}</p>
                )}
              </div>


              <div>
                <button
                  type="submit"
                  disabled={isRegisterSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isRegisterSubmitting ? 'Creating account...' : 'Sign Up'}
                </button>
              </div>
            </form>
          )}

          {/* Auth Toggle */}
          <div className="mt-4 text-center">
            <button
              onClick={toggleAuthMode}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              {isLogin ? (
                <>
                  Don't have an account? <span className="font-bold">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="font-bold">Sign in</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login (optional) */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Google
            </button>
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
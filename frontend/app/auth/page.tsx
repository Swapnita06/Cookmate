"use client"
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerUser, loginUser, resendVerification } from '../services/api';
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
  const [showVerificationNotice, setShowVerificationNotice] = useState(false)
  const [unverifiedUserId, setUnverifiedUserId] = useState<string | null>(null)
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
      const response = await loginUser(data)
      
      // Check if account is not verified
      if (response.data.message === "Account not verified") {
        setUnverifiedUserId(response.data.userId)
        setShowVerificationNotice(true)
        return
      }

      localStorage.setItem("token", response.data.token)
      toast.success("Logged in successfully!")
      router.push("/homepage")
    } catch (error: any) {
      if (error.response?.data?.message === "Account not verified") {
        setUnverifiedUserId(error.response.data.userId)
        setShowVerificationNotice(true)
      } else {
        toast.error(error.response?.data?.message || "Invalid credentials")
      }
    }
  }

  // Handle Register
  const onRegister = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
     toast.success("Registration successful! Please check your email to verify your account.")
      setIsLogin(true); // Switch to login after registration
      reset();
    } catch (error:any) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.")
    }
  };

 // Handle resend verification
  const handleResendVerification = async () => {
    if (!unverifiedUserId) return
    
    try {
      await resendVerification({ userId: unverifiedUserId })
      toast.success("Verification email resent successfully!")
      setShowVerificationNotice(false)
    } catch (error) {
      toast.error("Failed to resend verification email")
    }
  }


  return (
    
    //<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      
      <div
  className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
  style={{ backgroundImage: "url('/images/auth-bg.png')" }}
>

      <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
        {/* Auth Header */}
   {showVerificationNotice && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-6 rounded-lg max-w-sm">
              <h3 className="text-lg font-bold mb-4">Verify Your Email</h3>
              <p className="mb-4">Your account is not yet verified. Please check your email for the verification link.</p>
              <p className="mb-4">Didn't receive the email?</p>
              <div className="flex justify-between">
                <button 
                  onClick={() => setShowVerificationNotice(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Close
                </button>
                <button 
                  onClick={handleResendVerification}
                  className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                >
                  Resend Email
                </button>
              </div>
            </div>
          </div>
        )}


        <div className="bg-orange-500 px-6 py-4">
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
                <label htmlFor="login-email" className="block text-sm font-medium text-orange-500">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  {...loginRegister('email')}
                  className={`mt-1 block w-full rounded-md border-yellow-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    loginErrors.email ? 'border-red-500' : 'border'
                  }`}
                />
                {loginErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-orange-500">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  {...loginRegister('password')}
                  className={`mt-1 block w-full rounded-md border-yellow-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
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
    className="w-full flex justify-center py-2 px-4 border border-yellow rounded-full shadow-sm text-sm font-medium text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
  >
    {isLoginSubmitting ? 'Signing in...' : 'Sign In'}
  </button>
</div>

            </form>
          ) : (
            // Register Form
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-orange-500">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  {...registerRegister('email')}
                  className={`mt-1 block w-full rounded-md border-yellow-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    registerErrors.email ? 'border-red-500' : 'border'
                  }`}
                />
                {registerErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-orange-500">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  {...registerRegister('password')}
                  className={`mt-1 block w-full rounded-md border-yellow-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    registerErrors.password ? 'border-red-500' : 'border'
                  }`}
                />
                {registerErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.password.message}</p>
                )}
              </div>

  <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-orange-500">
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  {...registerRegister('name')}
                  className={`mt-1 block w-full rounded-md border-yellow-400 shadow-sm focus:border-yellow-500 focus:ring-indigo-500 sm:text-sm ${
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
                  className="w-full flex justify-center py-2 px-4 border border-yellow rounded-full shadow-sm text-sm font-medium text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
              className="text-sm font-medium text-orange-600 hover:text-orange-500 focus:outline-none"
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
              <div className="w-full border-t border-yellow-500"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login (optional) */}
          <div className="mt-6 grid grid-cols-2 gap-3">
         {/* Google Button */}
<button className="w-full inline-flex items-center justify-center py-2 px-4 border border-yellow-500 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-orange-500">
  <svg className="w-5 h-5 mr-2" viewBox="0 0 533.5 544.3">
    <path fill="#4285f4" d="M533.5 278.4c0-17.8-1.6-35-4.6-51.6H272v97.7h147.5c-6.4 34.3-25.6 63.4-54.5 83l87.9 68c51.4-47.3 80.6-117 80.6-197.1z"/>
    <path fill="#34a853" d="M272 544.3c73.6 0 135.3-24.3 180.3-65.8l-87.9-68c-24.4 16.3-55.4 26-92.4 26-70.9 0-131-47.9-152.4-112.1H28.4v70.6C73.9 482 166.7 544.3 272 544.3z"/>
    <path fill="#fbbc04" d="M119.6 324.4c-10.6-31.6-10.6-65.8 0-97.4V156.4H28.4c-40.9 81.7-40.9 177.9 0 259.6l91.2-70.6z"/>
    <path fill="#ea4335" d="M272 107.6c38.9 0 74 13.4 101.6 39.8l76.2-76.2C407.3 24.3 345.6 0 272 0 166.7 0 73.9 62.3 28.4 156.4l91.2 70.6C141 155.5 201.1 107.6 272 107.6z"/>
  </svg>
  Google
</button>

{/* GitHub Button */}
<button className="w-full inline-flex items-center justify-center py-2 px-4 border border-yellow-500 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-orange-500">
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.262.793-.583v-2.257c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.832 2.809 1.303 3.495.996.107-.774.42-1.303.762-1.603-2.665-.3-5.467-1.333-5.467-5.933 0-1.31.469-2.38 1.236-3.22-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.51 11.51 0 013.003-.404c1.02.005 2.045.137 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.12 3.176.77.84 1.234 1.91 1.234 3.22 0 4.61-2.807 5.63-5.48 5.922.43.372.814 1.102.814 2.222v3.293c0 .324.192.698.8.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
  GitHub
</button>

          </div>
        </div>
      </div>
    </div>
  );
}
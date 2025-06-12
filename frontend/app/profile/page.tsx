"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import Link from "next/link"
import {
  User,
  Edit3,
  Save,
  X,
  ChefHat,
  Heart,
  BookOpen,
  Plus,
  Clock,
  Users,
  Star,
  Camera,
  Mail,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react"
import { getUserProfile, updateUserProfile } from "../services/api"
import type { AxiosError } from "axios"
import Navbar from "../component/Navbar"

type UserProfile = {
  _id: string
  name: string
  email: string
  savedRecipes?: any[]
  createdRecipes?: any[]
  favRecipes?: any[]
}

type FormData = {
  name: string
  email: string
}

type ApiError = {
  response?: {
    status?: number
    data?: {
      message?: string
    }
  }
}

const ProfilePage = () => {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile()
        setUser(response.data)
        reset({
          name: response.data.name,
          email: response.data.email,
        })
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>
        setError("Failed to fetch profile")
        console.error(error)
        // Redirect to login if unauthorized
        if (error.response?.status === 401) {
          router.push("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [router, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const response = await updateUserProfile(data)
      setUser(
        (prev) =>
          ({
            ...prev,
            name: data.name,
            email: data.email,
          }) as UserProfile,
      )
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      toast.error(error.response?.data?.message || "Failed to update profile")
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-20 animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-red-200">
          <div className="text-red-600 text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
            <p className="text-red-500">{error || "User not found"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl">
          {/* Background with animated elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-1000"></div>
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full animate-spin"
                style={{ animationDuration: "20s" }}
              ></div>
            </div>
          </div>

          <div className="relative z-10 p-8 sm:p-12 text-white">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white text-amber-600 p-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* User Info */}
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{user.name}</h1>
                  <div className="flex items-center space-x-2 text-amber-100">
                    <Mail className="w-4 h-4" />
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-amber-100">
                    <Calendar className="w-4 h-4" />
                    <p className="text-sm">Member since 2024</p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="group bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-white/30"
              >
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Edit Profile</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Form/Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-100">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-amber-900">Personal Information</h2>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-amber-900 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register("name", { required: "Name is required" })}
                        className="w-full border border-amber-200 rounded-xl shadow-sm py-3 px-4 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                      {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        className="w-full border border-amber-200 rounded-xl shadow-sm py-3 px-4 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
                        placeholder="Enter your email address"
                      />
                      {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border border-amber-300 rounded-xl shadow-sm text-sm font-medium text-amber-700 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-300 transform hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </div>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                      <p className="text-sm font-medium text-amber-600 mb-1">Full Name</p>
                      <p className="text-lg font-semibold text-amber-900">{user.name}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                      <p className="text-sm font-medium text-amber-600 mb-1">Email Address</p>
                      <p className="text-lg font-semibold text-amber-900">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Created Recipes Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 w-12 h-12 rounded-full flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-amber-900">Your Created Recipes</h2>
                </div>
                <Link
                  href="/recipes/create"
                  className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Create Recipe</span>
                  </div>
                </Link>
              </div>

              {user.createdRecipes?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.createdRecipes.map((recipe) => (
                    <div
                      key={recipe._id}
                      className="group bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-amber-100 overflow-hidden"
                    >
                      {recipe.image && (
                        <div className="relative overflow-hidden">
                          <img
                            src={recipe.image || "/placeholder.svg"}
                            alt={recipe.title}
                            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-bold text-amber-900 text-lg mb-2 leading-tight">{recipe.title}</h3>
                        <p className="text-amber-700 text-sm mb-4 line-clamp-2 leading-relaxed">{recipe.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-amber-600">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{recipe.ingredients.length} ingredients</span>
                          </div>
                          <Link
                            href={`/recipes/${recipe._id}`}
                            className="text-amber-600 hover:text-amber-800 font-medium text-sm transition-colors duration-300 hover:underline"
                          >
                            View Recipe →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                  <ChefHat className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">No recipes created yet</h3>
                  <p className="text-amber-600 mb-6">Start sharing your culinary creations with the world!</p>
                  <Link
                    href="/recipes/create"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Your First Recipe</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="space-y-8">
            {/* Activity Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-100">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 w-12 h-12 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-amber-900">Your Activity</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-blue-200">
                  <div className="bg-gradient-to-r from-blue-400 to-indigo-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Saved Recipes</p>
                  <p className="text-3xl font-bold text-blue-900">{user.savedRecipes?.length || 0}</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-green-200">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-green-600 mb-1">Created Recipes</p>
                  <p className="text-3xl font-bold text-green-900">{user.createdRecipes?.length || 0}</p>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-red-200">
                  <div className="bg-gradient-to-r from-red-400 to-pink-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-red-600 mb-1">Favorites</p>
                  <p className="text-3xl font-bold text-red-900">{user.favRecipes?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-100">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-amber-900">Achievements</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 w-10 h-10 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">Recipe Creator</p>
                    <p className="text-sm text-amber-600">Created your first recipe</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 w-10 h-10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Community Member</p>
                    <p className="text-sm text-green-600">Joined the cooking community</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-400 w-10 h-10 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">Early Adopter</p>
                    <p className="text-sm text-purple-600">One of our first users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default ProfilePage

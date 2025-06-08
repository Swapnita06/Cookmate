"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { getUserProfile, updateUserProfile } from "../services/api"
import type { AxiosError } from "axios"
import Link from "next/link"

type UserProfile = {
  _id: string
  name: string
  email: string
  savedRecipes?: any[]
  createdRecipes?: any[]
  favRecipes?: any[]
}

// type UserProfile = {
//   _id?: string;
//   name?: string;
//   email?: string;
//   savedRecipes?: any[];
//   createdRecipes?: any[];
//   favRecipes?: any[];
// };

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
     // setUser(response.data)
     setUser(prev => ({
      ...prev,
      name: data.name,
      email: data.email
    } as UserProfile))
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "User not found"}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-blue-500 text-2xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-blue-100">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-4 sm:mt-0 px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 sm:p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register("name", { required: "Name is required" })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-medium text-gray-900">Your Activity</h2>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-sm font-medium text-blue-600">Saved Recipes</p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">{user.savedRecipes?.length || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-sm font-medium text-green-600">Created Recipes</p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">{user.createdRecipes?.length || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <p className="text-sm font-medium text-purple-600">Favorites</p>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">{user.favRecipes?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Created Recipes Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Your Created Recipes</h2>
                    <Link
                      href="/recipes/create"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Create Recipe
                    </Link>
                  </div>

                  {user.createdRecipes?.length ? (
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {user.createdRecipes.map((recipe) => (
                        <div key={recipe._id} className="bg-white rounded-lg shadow overflow-hidden">
                          {recipe.image && (
                            <img
                              src={recipe.image || "/placeholder.svg"}
                              alt={recipe.title}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-medium text-gray-900">{recipe.title}</h3>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{recipe.description}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-sm text-gray-500">{recipe.ingredients.length} ingredients</span>
                              <Link
                                href={`/recipes/${recipe._id}`}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                View Recipe
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No recipes created yet</p>
                      <Link
                        href="/recipes/create"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Create Your First Recipe
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

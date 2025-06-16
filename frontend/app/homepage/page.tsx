"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getAllRecipes } from "../services/recipeService"
import type { Recipe } from "../component/types/recipe"
import { useAuth } from "../context/AuthContext"
import Link from "next/link"
import {
  Search,
  Heart,
  Bookmark,
  Users,
  Clock,
  Star,
  ChefHat,
  Sparkles,
  Utensils,
  Filter,
  TrendingUp,
  User,
  MessageCircle,
} from "lucide-react"
import Navbar from "../component/Navbar"

export default function HomePage() {
  // Navbar state
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Recipe state
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredRecipe, setHoveredRecipe] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("All")

  useEffect(() => {
    setMounted(true)
    const fetchRecipes = async () => {
      try {
        const data = await getAllRecipes()
        setRecipes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recipes")
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
  }, [])

  if (!mounted) return null

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Categories for filtering (this would be dynamic in a real app)
  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Vegetarian"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 opacity-90"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full animate-spin"
            style={{ animationDuration: "20s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
                <ChefHat className="w-8 h-8 text-white animate-bounce" />
              </div>
              <Sparkles className="w-6 h-6 text-amber-200 ml-2 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Discover Delicious Recipes</h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto mb-8">
              Find and share the best recipes from around the world. Cook with confidence and creativity.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for recipes, ingredients, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-4 px-6 pl-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-amber-100 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-lg"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white/80 backdrop-blur-sm shadow-md top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center space-x-2 text-amber-800 mr-4">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters:</span>
            </div>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                    : "bg-amber-100/50 text-amber-800 hover:bg-amber-200/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Recipes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-amber-900">Featured Recipes</h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-20 animate-pulse"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-red-200">
            <div className="text-red-600 text-center">
              <div className="text-6xl mb-4">😞</div>
              <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
              <p className="text-red-500">Error: {error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe._id}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border border-amber-100"
                onMouseEnter={() => setHoveredRecipe(recipe._id)}
                onMouseLeave={() => setHoveredRecipe(null)}
              >
                {/* Recipe Image */}
                <div className="relative overflow-hidden h-56">
                 {recipe.image ? (
  <Image
    src={recipe.image.startsWith('http') ? recipe.image : `/images/${recipe.image}`}
    alt={recipe.title}
    width={400}
    height={300}
    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
  />
) : (
  <div className="w-full h-full bg-gradient-to-br from-amber-300 via-orange-300 to-red-300 flex items-center justify-center">
    <Utensils className="w-12 h-12 text-white" />
  </div>
)}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Floating Action Buttons */}
                  <div
                    className={`absolute top-4 right-4 flex flex-col space-y-2 transition-all duration-500 ${
                      hoveredRecipe === recipe._id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                    }`}
                  >
                    <button className="p-3 rounded-full backdrop-blur-sm bg-white/20 text-white hover:bg-red-500 shadow-lg transition-all duration-300 transform hover:scale-110">
                      <Heart className="w-5 h-5 hover:rotate-12 transition-transform duration-300" />
                    </button>
                    <button className="p-3 rounded-full backdrop-blur-sm bg-white/20 text-white hover:bg-blue-500 shadow-lg transition-all duration-300 transform hover:scale-110">
                      <Bookmark className="w-5 h-5 hover:rotate-12 transition-transform duration-300" />
                    </button>
                  </div>

                  {/* Recipe Quick Info */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-500 ${
                      hoveredRecipe === recipe._id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                  >
                    <div className="flex justify-between text-white">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {recipe.steps.reduce((total, step) => total + step.time, 0)} mins
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 fill-current text-red-500" />
                        <span className="text-sm">{recipe.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{recipe.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipe Content */}
                <div className="p-6">
                  <Link href={`/recipes/${recipe._id}`}>
                    <h3 className="text-xl font-bold text-amber-900 mb-2 hover:text-amber-600 transition-colors duration-300">
                      {recipe.title}
                    </h3>
                  </Link>
                  <p className="text-amber-700 mb-4 line-clamp-2">{recipe.description}</p>

                  {/* Recipe Meta */}
                  <div className="flex items-center justify-between">
                    {/* Author */}
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-300 to-orange-300 p-0.5">
                          <div className="w-full h-full rounded-full overflow-hidden bg-white">
                            {typeof recipe.createdBy !== "string" && recipe.createdBy.image ? (
                              <Image
                                src={recipe.createdBy.image || "/placeholder.svg"}
                                alt={recipe.createdBy.name}
                                className="w-full h-full object-cover"
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-amber-200 to-orange-200 flex items-center justify-center">
                                <User className="w-5 h-5 text-amber-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          {typeof recipe.createdBy === "string" ? "Unknown" : recipe.createdBy.name}
                        </p>
                        <p className="text-xs text-amber-600">
                          {new Date(recipe.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Recipe Stats */}
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-amber-400 fill-current" strokeWidth={0} />
                        ))}
                      </div>
                      <span className="text-xs text-amber-600">(4.8)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRecipes.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border border-amber-200">
            <ChefHat className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-900 mb-2">No recipes found</h3>
            <p className="text-amber-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Popular Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-r from-green-400 to-emerald-400 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-amber-900">Popular Categories</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: "Breakfast", icon: <ChefHat className="w-6 h-6" />, color: "from-amber-400 to-orange-400" },
            { name: "Lunch", icon: <Utensils className="w-6 h-6" />, color: "from-green-400 to-emerald-400" },
            { name: "Dinner", icon: <Users className="w-6 h-6" />, color: "from-blue-400 to-indigo-400" },
            { name: "Dessert", icon: <Sparkles className="w-6 h-6" />, color: "from-purple-400 to-pink-400" },
            { name: "Vegetarian", icon: <Star className="w-6 h-6" />, color: "from-red-400 to-pink-400" },
            { name: "Quick & Easy", icon: <Clock className="w-6 h-6" />, color: "from-yellow-400 to-amber-400" },
          ].map((category) => (
            <div
              key={category.name}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-amber-100 cursor-pointer"
            >
              <div
                className={`bg-gradient-to-r ${category.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}
              >
                <div className="text-white group-hover:rotate-12 transition-transform duration-300">
                  {category.icon}
                </div>
              </div>
              <h3 className="font-semibold text-amber-900">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Share Your Culinary Creations</h2>
              <p className="text-amber-100 text-lg max-w-xl">
                Join our community of food enthusiasts and share your favorite recipes with the world. Get feedback,
                save your favorites, and discover new culinary inspirations.
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              <Link
                href="/recipes/create"
                className="px-8 py-4 bg-white text-amber-600 rounded-xl font-bold text-lg hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
              >
                Create Recipe
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-white/30 text-center"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  Timer,
  Utensils,
  User,
  Bookmark,
  Clock,
  Users,
  Star,
  Send,
} from "lucide-react"
import { getRecipe, likeRecipe, saveRecipe, addComment } from "../../services/recipeService"
import type { Recipe } from "../../component/types/recipe"
import { useAuth } from "../../context/AuthContext"
import VoiceAssistant from "../../component/VoiceAssistant"
import Navbar from "@/app/component/Navbar"

const RecipeDetailPage = () => {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [showFloatingActions, setShowFloatingActions] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipe(id as string)
        setRecipe(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recipe")
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [id])

  const handleLike = async () => {
    if (!isAuthenticated || !user || !recipe) return

    try {
      await likeRecipe(recipe._id, localStorage.getItem("token") || "")
      setRecipe((prev) => {
        if (!prev) return null
        const isLiked = prev.likes.some((like) =>
          typeof like === "string" ? like === user._id : like._id === user._id,
        )
        return {
          ...prev,
          likes: isLiked
            ? prev.likes.filter((like) => (typeof like === "string" ? like !== user._id : like._id !== user._id))
            : [...prev.likes, { _id: user._id, name: user.name, email: user.email }],
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to like recipe")
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated || !user || !recipe) return

    try {
      await saveRecipe(recipe._id, localStorage.getItem("token") || "")
      setRecipe((prev) => {
        if (!prev) return null
        const isSaved = prev.savedBy?.includes(user._id) || false
        return {
          ...prev,
          savedBy: isSaved ? prev.savedBy?.filter((id) => id !== user._id) : [...(prev.savedBy || []), user._id],
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recipe")
    }
  }

  const handleCommentSubmit = async () => {
    if (!isAuthenticated || !user || !commentText.trim() || !recipe) return

    setIsSubmittingComment(true)
    try {
      const newComment = await addComment(recipe._id, commentText, localStorage.getItem("token") || "")

      setRecipe((prev) => {
        if (!prev) return null
        return {
          ...prev,
          comments: [...prev.comments, newComment],
        }
      })

      setCommentText("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-red-200">
            <div className="text-red-600 text-center">
              <div className="text-6xl mb-4">😞</div>
              <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
              <p className="text-red-500">Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
            <div className="text-amber-600 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold">Recipe not found</h2>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isLiked =
    user && recipe.likes.some((like) => (typeof like === "string" ? like === user._id : like._id === user._id))
  const isSaved = user && recipe.savedBy?.includes(user._id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/homepage"
              className="group inline-flex items-center space-x-2 text-amber-700 hover:text-amber-900 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to all recipes</span>
            </Link>
          </div>

          {/* Voice Assistant - Prominent Feature */}
          <VoiceAssistant recipe={recipe} />

          {/* Recipe Hero Section */}
          <div
            className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl group"
            onMouseEnter={() => setShowFloatingActions(true)}
            onMouseLeave={() => setShowFloatingActions(false)}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
              {recipe.image && (
                <div className="lg:w-1/2 relative overflow-hidden">
                  <img
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title}
                    className="w-full h-64 lg:h-96 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Floating Action Buttons */}
                  <div
                    className={`absolute top-4 right-4 flex flex-col space-y-2 transition-all duration-500 ${showFloatingActions ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                  >
                    <button
                      onClick={handleLike}
                      className={`p-3 rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 transform hover:scale-110 ${isLiked ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-red-500"}`}
                      aria-label="Like"
                    >
                      <Heart
                        className={`w-5 h-5 ${isLiked ? "fill-current" : ""} hover:rotate-12 transition-transform duration-300`}
                      />
                    </button>
                    <button
                      onClick={handleSave}
                      className={`p-3 rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 transform hover:scale-110 ${isSaved ? "bg-blue-500 text-white" : "bg-white/20 text-white hover:bg-blue-500"}`}
                      aria-label="Save"
                    >
                      <Bookmark
                        className={`w-5 h-5 ${isSaved ? "fill-current" : ""} hover:rotate-12 transition-transform duration-300`}
                      />
                    </button>
                    <button className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-green-500 shadow-lg transition-all duration-300 transform hover:scale-110">
                      <Share2 className="w-5 h-5 hover:rotate-12 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div
                className={`${recipe.image ? "lg:w-1/2" : "w-full"} bg-gradient-to-br from-white via-amber-50 to-orange-50 p-8 lg:p-12 backdrop-blur-sm`}
              >
                <div className="h-full flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-6">
                    <h1 className="text-4xl lg:text-5xl font-bold text-amber-900 leading-tight flex-1 mr-4">
                      {recipe.title}
                    </h1>
                    {!recipe.image && (
                      <div className="flex gap-2">
                        <button
                          onClick={handleLike}
                          className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${isLiked ? "bg-red-500 text-white" : "bg-white/60 text-red-500 hover:bg-red-500 hover:text-white"}`}
                          aria-label="Like"
                        >
                          <Heart
                            className={`w-5 h-5 ${isLiked ? "fill-current" : ""} hover:rotate-12 transition-transform duration-300`}
                          />
                          <span className="ml-1 text-sm font-medium">{recipe.likes.length}</span>
                        </button>
                        <button
                          onClick={handleSave}
                          className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${isSaved ? "bg-blue-500 text-white" : "bg-white/60 text-blue-500 hover:bg-blue-500 hover:text-white"}`}
                          aria-label="Save"
                        >
                          <Bookmark
                            className={`w-5 h-5 ${isSaved ? "fill-current" : ""} hover:rotate-12 transition-transform duration-300`}
                          />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-amber-700 mb-8 text-lg leading-relaxed">{recipe.description}</p>

                  {/* Recipe Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-300 shadow-lg">
                      <div className="bg-gradient-to-r from-amber-400 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-6 h-6 text-white hover:rotate-12 transition-transform duration-300" />
                      </div>
                      <div className="text-2xl font-bold text-amber-900">
                        {recipe.steps.reduce((total, step) => total + step.time, 0)}
                      </div>
                      <div className="text-sm text-amber-600">Minutes</div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-300 shadow-lg">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-white hover:rotate-12 transition-transform duration-300" />
                      </div>
                      <div className="text-2xl font-bold text-amber-900">4-6</div>
                      <div className="text-sm text-amber-600">Servings</div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-300 shadow-lg">
                      <div className="bg-gradient-to-r from-red-400 to-pink-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Heart className="w-6 h-6 text-white hover:rotate-12 transition-transform duration-300" />
                      </div>
                      <div className="text-2xl font-bold text-amber-900">{recipe.likes.length}</div>
                      <div className="text-sm text-amber-600">Likes</div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-300 shadow-lg">
                      <div className="bg-gradient-to-r from-purple-400 to-indigo-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-6 h-6 text-white hover:rotate-12 transition-transform duration-300" />
                      </div>
                      <div className="text-2xl font-bold text-amber-900">4.8</div>
                      <div className="text-sm text-amber-600">Rating</div>
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center space-x-4 p-4 bg-white/40 backdrop-blur-sm rounded-2xl transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 p-1">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white">
                          {typeof recipe.createdBy !== "string" && recipe.createdBy.image ? (
                            <img
                              src={recipe.createdBy.image || "/placeholder.svg"}
                              alt={typeof recipe.createdBy === "string" ? "User" : recipe.createdBy.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-amber-200 to-orange-200 flex items-center justify-center">
                              <User className="w-8 h-8 text-amber-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900 text-lg">
                        {typeof recipe.createdBy === "string" ? "Unknown" : recipe.createdBy.name}
                      </div>
                      <div className="text-amber-600 text-sm">
                        Created on{" "}
                        {new Date(recipe.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-100 transform hover:scale-[1.01] transition-all duration-300">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 w-12 h-12 rounded-full flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white hover:rotate-12 transition-transform duration-300" />
                </div>
                <h2 className="text-3xl font-bold text-amber-900">Ingredients</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={`ingredient-${index}`}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                    <span className="text-amber-800 font-medium">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-100">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-gradient-to-r from-blue-400 to-indigo-400 w-12 h-12 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white hover:rotate-12 transition-transform duration-300" />
                </div>
                <h2 className="text-3xl font-bold text-amber-900">Instructions</h2>
              </div>
              <div className="space-y-6">
                {recipe.steps.map((step, index) => (
                  <div
                    key={step._id || step.stepNumber}
                    className="group relative bg-gradient-to-r from-white via-amber-50 to-orange-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-amber-100"
                  >
                    <div className="flex items-start gap-6">
                      <div className="relative">
                        <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {step.stepNumber}
                        </div>
                        {index < recipe.steps.length - 1 && (
                          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-amber-300 to-orange-300"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-900 text-lg mb-2 leading-relaxed">
                          {step.instruction}
                        </h3>
                        <div className="flex items-center space-x-2 text-amber-600">
                          <Timer className="w-4 h-4 hover:rotate-12 transition-transform duration-300" />
                          <span className="text-sm font-medium">Time: {step.time} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-100">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 w-12 h-12 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white hover:rotate-12 transition-transform duration-300" />
                </div>
                <h2 className="text-3xl font-bold text-amber-900">Comments ({recipe.comments.length})</h2>
              </div>

              {/* Comment Input */}
              {isAuthenticated && (
                <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-300 to-orange-300 p-0.5 flex-shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white">
                        {user?.image ? (
                          <img
                            src={user.image || "/placeholder.svg"}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-amber-200 to-orange-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-amber-600" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 border border-amber-200 rounded-xl px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300"
                        onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit()}
                      />
                      <button
                        onClick={handleCommentSubmit}
                        disabled={!commentText.trim() || isSubmittingComment}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmittingComment ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {recipe.comments.length > 0 ? (
                  recipe.comments.map((comment, index) => (
                    <div
                      key={typeof comment === "string" ? `comment-${comment}` : comment._id || `comment-${index}`}
                      className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] border border-amber-100"
                    >
                      {typeof comment === "string" ? (
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-300 to-orange-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-amber-900">Unknown User</div>
                            <div className="text-sm text-amber-600">Comment ID: {comment}</div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-300 to-orange-300 p-0.5">
                                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                  {typeof comment.user !== "string" && comment.user.image ? (
                                    <img
                                      src={comment.user.image || "/placeholder.svg"}
                                      alt={typeof comment.user === "string" ? "User" : comment.user.name}
                                      className="w-full h-full object-cover"
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
                              <div className="font-medium text-amber-900">
                                {typeof comment.user === "string" ? "Unknown" : comment.user.name}
                              </div>
                              <div className="text-sm text-amber-600">
                                {new Date(comment.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <p className="text-amber-800 leading-relaxed">{comment.text}</p>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                    <p className="text-amber-600 text-lg">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetailPage

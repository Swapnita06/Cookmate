"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "react-toastify"
import { Plus, Minus, ChefHat, Utensils, Save, X,  Sparkles, BookOpen, Timer } from "lucide-react"
//import Link from "next/link"
import Navbar from "@/app/component/Navbar"

const CreateRecipePage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: [""],
    steps: [
      {
        stepNumber: 1,
        instruction: "",
        time: 0,
      },
    ],
    image: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = value
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }))
  }

  const addIngredient = () => {
    setFormData((prev) => ({ ...prev, ingredients: [...prev.ingredients, ""] }))
  }

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }))
  }

  const handleStepChange = (index: number, field: string, value: string | number) => {
    const newSteps = [...formData.steps]
    const parsedValue = field === "time" ? (typeof value === "string" ? Number.parseInt(value) || 0 : value) : value
    newSteps[index] = { ...newSteps[index], [field]: parsedValue }
    setFormData((prev) => ({ ...prev, steps: newSteps }))
  }

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          stepNumber: prev.steps.length + 1,
          instruction: "",
          time: 0,
        },
      ],
    }))
  }

  const removeStep = (index: number) => {
    const newSteps = formData.steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, stepNumber: i + 1 }))
    setFormData((prev) => ({ ...prev, steps: newSteps }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

      if (!token) {
        toast.error("Please log in to create recipes")
        router.push("/login")
        return
      }

      //Create recipe
       await axios.post("https://cookmate-1-v0vt.onrender.com/api/receipe/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Refresh user data
       await axios.get("https://cookmate-1-v0vt.onrender.com/api/users/get_profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success("Recipe created successfully!")
      router.push("/profile")
    } catch (error) {
      toast.error("Failed to create recipe")
      console.error(error)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.push("/login")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-500">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full animate-spin"
            style={{ animationDuration: "20s" }}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* <Link
                href="/p"
                className="group bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              </Link> */}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                    <ChefHat className="w-6 h-6 text-white animate-bounce" />
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Create New Recipe</h1>
                <p className="text-amber-100 mt-2">Share your culinary masterpiece with the world</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-100">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 w-12 h-12 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-amber-900 mb-2">
                  Recipe Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter a delicious recipe title..."
                  className="w-full border border-amber-200 rounded-xl shadow-sm py-3 px-4 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-amber-900 placeholder-amber-500"
                />
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-amber-900 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your recipe and what makes it special..."
                  className="w-full border border-amber-200 rounded-xl shadow-sm py-3 px-4 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-amber-900 placeholder-amber-500 resize-none"
                />
              </div>

              <div className="lg:col-span-2">
                {/* <label htmlFor="image" className="block text-sm font-medium text-amber-900 mb-2">
                  Image URL (optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/your-recipe-image.jpg"
                    className="w-full border border-amber-200 rounded-xl shadow-sm py-3 px-4 pl-12 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-amber-900 placeholder-amber-500"
                  />
                  <ImageIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                </div> */}
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 w-12 h-12 rounded-full flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-amber-900">Ingredients</h2>
              </div>
              <button
                type="button"
                onClick={addIngredient}
                className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Add Ingredient</span>
                </div>
              </button>
            </div>

            <div className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 transform hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    required
                    placeholder={`Ingredient ${index + 1}...`}
                    className="flex-1 border border-amber-200 rounded-lg shadow-sm py-2 px-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-amber-900 placeholder-amber-500"
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300 transform hover:scale-110"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-400 to-indigo-400 w-12 h-12 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-amber-900">Cooking Steps</h2>
              </div>
              <button
                type="button"
                onClick={addStep}
                className="group bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Add Step</span>
                </div>
              </button>
            </div>

            <div className="space-y-6">
              {formData.steps.map((step, index) => (
                <div
                  key={index}
                  className="relative bg-gradient-to-r from-white via-amber-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-amber-100 transform hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-lg">
                        {step.stepNumber}
                      </div>
                      {index < formData.steps.length - 1 && (
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-amber-300 to-orange-300"></div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-amber-900 mb-2">Instruction</label>
                        <textarea
                          value={step.instruction}
                          onChange={(e) => handleStepChange(index, "instruction", e.target.value)}
                          required
                          rows={3}
                          placeholder={`Describe step ${step.stepNumber} in detail...`}
                          className="w-full border border-amber-200 rounded-lg shadow-sm py-3 px-4 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-amber-900 placeholder-amber-500 resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Timer className="w-4 h-4 text-amber-600" />
                            <label className="text-sm font-medium text-amber-900">Time (minutes)</label>
                          </div>
                          <input
                            type="number"
                            value={isNaN(step.time) ? "" : step.time}
                            onChange={(e) => handleStepChange(index, "time", Number.parseInt(e.target.value) || 0)}
                            required
                            min="0"
                            placeholder="0"
                            className="w-20 border border-amber-200 rounded-lg shadow-sm py-2 px-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 text-amber-900 text-center"
                          />
                        </div>

                        {formData.steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-300 transform hover:scale-105 font-medium"
                          >
                            <div className="flex items-center space-x-2">
                              <X className="w-4 h-4" />
                              <span>Remove</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-100">
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="px-8 py-3 border border-amber-300 rounded-xl shadow-sm text-sm font-medium text-amber-700 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center space-x-2">
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </div>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-300 transform hover:scale-105 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed transform-none" : ""
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Recipe</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}

export default CreateRecipePage

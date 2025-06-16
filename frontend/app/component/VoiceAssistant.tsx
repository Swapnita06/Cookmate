"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import OpenAI from "openai"
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  MessageCircle,
  ChefHat,
  Sparkles,
  Zap,
} from "lucide-react"
import type { Recipe } from "../component/types/recipe"

interface VoiceAssistantProps {
  recipe: Recipe
}

const VoiceAssistant = ({ recipe }: VoiceAssistantProps) => {
  const [isActive, setIsActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentlySpeakingStepIndex, setCurrentlySpeakingStepIndex] = useState<number | null>(null)
  const [conversation, setConversation] = useState<string[]>([])
  const [isContinuousMode, setIsContinuousMode] = useState(false)
  const [lastSpokenStepIndex, setLastSpokenStepIndex] = useState<number | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  })

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      setCurrentlySpeakingStepIndex(null)
    }
    if (listening) {
      SpeechRecognition.stopListening()
    }
  }, [listening])

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    return () => {
      stopSpeaking()
    }
  }, [stopSpeaking])

  const pauseResume = useCallback(() => {
    if (!synthRef.current) return

    if (synthRef.current.paused) {
      synthRef.current.resume()
      setIsSpeaking(true)
    } else if (isSpeaking) {
      synthRef.current.pause()
      setIsSpeaking(false)
    } else if (utteranceRef.current) {
      synthRef.current.resume()
      setIsSpeaking(true)
    }
  }, [isSpeaking])

  const repeatCurrentStep = useCallback(() => {
    if (currentlySpeakingStepIndex !== null) {
      readStep(currentlySpeakingStepIndex)
    } else if (lastSpokenStepIndex !== null) {
      readStep(lastSpokenStepIndex)
    } else {
      readCurrentStep()
    }
  }, [currentlySpeakingStepIndex, lastSpokenStepIndex])

  const handleNextStep = useCallback(() => {
    const nextStepIndex = currentlySpeakingStepIndex !== null ? currentlySpeakingStepIndex + 1 : currentStepIndex + 1
    stopSpeaking()

    if (nextStepIndex < recipe.steps.length) {
      readStep(nextStepIndex)
    } else {
      speak("You&apos;ve completed all steps!")
    }
  }, [currentlySpeakingStepIndex, currentStepIndex, recipe.steps.length, stopSpeaking])

  const handlePrevStep = useCallback(() => {
    const prevStepIndex = currentlySpeakingStepIndex !== null ? currentlySpeakingStepIndex - 1 : currentStepIndex - 1
    stopSpeaking()

    if (prevStepIndex >= 0) {
      readStep(prevStepIndex)
    } else {
      speak("This is the first step.")
      readStep(0)
    }
  }, [currentlySpeakingStepIndex, currentStepIndex, stopSpeaking])

  const handleUserQuery = useCallback(async (query: string) => {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes("next") || lowerQuery.includes("next step")) {
      handleNextStep()
      return
    } else if (lowerQuery.includes("previous") || lowerQuery.includes("back")) {
      handlePrevStep()
      return
    } else if (lowerQuery.includes("repeat")) {
      repeatCurrentStep()
      return
    } else if (lowerQuery.includes("pause")) {
      pauseResume()
      return
    } else if (lowerQuery.includes("resume") || lowerQuery.includes("continue")) {
      pauseResume()
      return
    } else if (lowerQuery.includes("stop")) {
      stopSpeaking()
      return
    }

    const prompt = `
      You are a cooking assistant helping with the recipe: ${recipe.title}.
      Current step: ${currentStepIndex + 1} of ${recipe.steps.length}
      Ingredients: ${recipe.ingredients.join(", ")}.
      Steps: ${recipe.steps.map((step, index) => `${index + 1}. ${step.instruction} (${step.time} mins)`).join("\n")}
      
      Current conversation context:
      ${conversation.slice(-3).join("\n")}
      
      User asked: ${query}
      
      Respond concisely and helpfully as a cooking assistant.
      If the user asks about the current step, provide details about step ${currentStepIndex + 1}.
    `

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      })

      const assistantResponse = response.choices[0]?.message?.content || "I didn&apos;t understand that."
      setConversation((prev) => [...prev, `User: ${query}`, `Assistant: ${assistantResponse}`])
      speak(assistantResponse)
    } catch (error) {
      console.error("Error calling OpenAI:", error)
      speak("Sorry, I encountered an error. Please try again.")
    }
  }, [conversation, currentStepIndex, handleNextStep, handlePrevStep, pauseResume, recipe, repeatCurrentStep, stopSpeaking])

  useEffect(() => {
    if (!listening && transcript) {
      handleUserQuery(transcript)
      resetTranscript()

      if (isContinuousMode) {
        setTimeout(() => {
          SpeechRecognition.startListening()
        }, 1000)
      }
    }
  }, [listening, transcript, resetTranscript, isContinuousMode, handleUserQuery])

  const speak = (text: string, stepIndex?: number) => {
    if (!synthRef.current) return

    stopSpeaking()
    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    if (stepIndex !== undefined) {
      setCurrentlySpeakingStepIndex(stepIndex)
      setLastSpokenStepIndex(stepIndex)
    } else {
      setCurrentlySpeakingStepIndex(null)
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      setCurrentlySpeakingStepIndex(null)
      utteranceRef.current = null

      if (isContinuousMode && !listening) {
        setTimeout(() => {
          SpeechRecognition.startListening()
        }, 500)
      }
    }

    synthRef.current.speak(utterance)
  }

  const readRecipe = () => {
    const fullRecipe = `
      Recipe: ${recipe.title}.
      Description: ${recipe.description}.
      Ingredients: ${recipe.ingredients.join(", ")}.
      Let&apos;s begin cooking:
      ${recipe.steps.map((step, index) => `Step ${index + 1}: ${step.instruction} (Time: ${step.time} minutes)`).join(". ")}
    `
    speak(fullRecipe)
  }

  const readStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < recipe.steps.length) {
      const step = recipe.steps[stepIndex]
      const stepText = `Step ${stepIndex + 1}: ${step.instruction} (Time: ${step.time} minutes)`
      speak(stepText, stepIndex)
      setCurrentStepIndex(stepIndex)
    } else if (stepIndex >= recipe.steps.length) {
      const completionText = "You&apos;ve completed all steps of this recipe!"
      speak(completionText)
    }
  }

  const readCurrentStep = () => {
    readStep(currentStepIndex)
  }

  const handleClose = () => {
    stopSpeaking()
    setIsActive(false)
    setIsContinuousMode(false)
  }

  const toggleContinuousMode = () => {
    alert("Coming Soon!")
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
        Browser doesn&apos;t support speech recognition.
      </div>
    )
  }

  return (
    <>
      <div className="mb-12">
        <div className="bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 rounded-3xl p-8 shadow-2xl border-2 border-amber-200 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-orange-300 to-red-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-10 animate-spin"
              style={{ animationDuration: "20s" }}
            ></div>
          </div>

          <div className="relative z-10 text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
                <ChefHat className="w-8 h-8 text-white animate-bounce" />
              </div>
              <Sparkles className="w-6 h-6 text-amber-500 ml-2 animate-pulse" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent mb-2">
              AI Cooking Assistant
            </h2>
            <p className="text-amber-700 text-lg font-medium">Your hands-free cooking companion with voice commands</p>
          </div>

          {!isActive ? (
            <div className="relative z-10 text-center">
              <div className="mb-8">
                <button
                  onClick={() => {
                    setIsActive(true)
                    readRecipe()
                  }}
                  className="group relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-6 px-12 rounded-full text-xl shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse hover:animate-none"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Mic className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping"></div>
                    </div>
                    <span>Start Voice Assistant</span>
                    <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 shadow-lg">
                  <Volume2 className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-bold text-amber-900 mb-2">Voice Commands</h3>
                  <p className="text-amber-700 text-sm">Say &quot;next&quot;, &quot;previous&quot;, &quot;repeat&quot;, or ask questions</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 shadow-lg">
                  <MessageCircle className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-bold text-amber-900 mb-2">Smart Responses</h3>
                  <p className="text-amber-700 text-sm">AI-powered answers to your cooking questions</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 shadow-lg">
                  <ChefHat className="w-8 h-8 text-red-600 mx-auto mb-3" />
                  <h3 className="font-bold text-amber-900 mb-2">Hands-Free</h3>
                  <p className="text-amber-700 text-sm">Cook without touching your device</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              {!isMinimized ? (
                <div className="space-y-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full ${isSpeaking ? "bg-green-500 animate-pulse" : listening ? "bg-blue-500 animate-pulse" : "bg-gray-400"}`}
                        ></div>
                        <span className="font-semibold text-amber-900">
                          {isSpeaking ? "Speaking..." : listening ? "Listening..." : "Ready"}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setIsMinimized(true)}
                          className="text-amber-600 hover:text-amber-800 transition-colors duration-300"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={handleClose}
                          className="text-red-600 hover:text-red-800 transition-colors duration-300"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-amber-900 mb-1">
                        Step {currentStepIndex + 1} of {recipe.steps.length}
                      </div>
                      {currentlySpeakingStepIndex !== null && currentlySpeakingStepIndex !== currentStepIndex && (
                        <div className="text-blue-600 font-medium">
                          Currently Speaking: Step {currentlySpeakingStepIndex + 1}
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-4">
                      <div className="text-amber-900 font-medium text-lg leading-relaxed">
                        {recipe.steps[currentStepIndex]?.instruction}
                      </div>
                      <div className="text-amber-600 text-sm mt-2">
                        Time: {recipe.steps[currentStepIndex]?.time} minutes
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <button
                      onClick={handlePrevStep}
                      className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    >
                      <SkipBack className="w-5 h-5" />
                      <span className="hidden md:inline">Previous</span>
                    </button>

                    <button
                      onClick={repeatCurrentStep}
                      className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span className="hidden md:inline">Repeat</span>
                    </button>

                    <button
                      onClick={pauseResume}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    >
                      {isSpeaking ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      <span className="hidden md:inline">{isSpeaking ? "Pause" : "Resume"}</span>
                    </button>

                    <button
                      onClick={stopSpeaking}
                      className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    >
                      <Square className="w-5 h-5" />
                      <span className="hidden md:inline">Stop</span>
                    </button>

                    <button
                      onClick={handleNextStep}
                      className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    >
                      <SkipForward className="w-5 h-5" />
                      <span className="hidden md:inline">Next</span>
                    </button>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-4 mb-4">
                      <button
                        onClick={() => SpeechRecognition.startListening()}
                        className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
                          listening
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse"
                            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        }`}
                      >
                        {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </button>
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-amber-900">
                          {listening ? "Listening for your command..." : "Tap to ask a question"}
                        </div>
                        {transcript && <div className="text-amber-700 text-sm mt-1">You said: &quot;{transcript}&quot;</div>}
                      </div>
                    </div>

                    <button
                      onClick={toggleContinuousMode}
                      className={`w-full p-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        isContinuousMode
                          ? "bg-gradient-to-r from-green-400 to-emerald-400 text-white"
                          : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400"
                      }`}
                    >
                      Continuous Mode {isContinuousMode ? "ON" : "OFF"}
                    </button>
                  </div>

                  {conversation.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                      <h3 className="font-bold text-amber-900 mb-4 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Conversation History
                      </h3>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {conversation.slice(-6).map((msg, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg text-sm ${
                              msg.startsWith("User:")
                                ? "bg-amber-100 text-amber-800 ml-4"
                                : "bg-orange-100 text-orange-800 mr-4"
                            }`}
                          >
                            {msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${isSpeaking ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}
                      ></div>
                      <span className="font-semibold text-amber-900">
                        Step {currentStepIndex + 1} of {recipe.steps.length}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsMinimized(false)}
                        className="text-amber-600 hover:text-amber-800 transition-colors duration-300"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={handleClose}
                        className="text-red-600 hover:text-red-800 transition-colors duration-300"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default VoiceAssistant
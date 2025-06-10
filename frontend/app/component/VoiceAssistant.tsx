"use client"

import { useState, useEffect, useRef } from "react"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import OpenAI from "openai"
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
  const [userQuery, setUserQuery] = useState("")
  const [isContinuousMode, setIsContinuousMode] = useState(false)
  const [lastSpokenText, setLastSpokenText] = useState("")
  const [lastSpokenStepIndex, setLastSpokenStepIndex] = useState<number | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  })

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    return () => {
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    if (!listening && transcript) {
      const query = transcript.toLowerCase()
      setUserQuery(transcript)

      // Handle voice commands
      if (query.includes("next") || query.includes("next step")) {
        handleNextStep()
      } else if (query.includes("previous") || query.includes("back")) {
        handlePrevStep()
      } else if (query.includes("repeat")) {
        repeatCurrentStep()
      } else if (query.includes("pause")) {
        pauseResume()
      } else if (query.includes("resume") || query.includes("continue")) {
        pauseResume()
      } else if (query.includes("stop")) {
        stopSpeaking()
      } else {
        // Handle normal queries
        handleUserQuery(transcript)
      }

      resetTranscript()

      // Restart listening if in continuous mode
      if (isContinuousMode) {
        setTimeout(() => {
          SpeechRecognition.startListening()
        }, 1000)
      }
    }
  }, [listening, transcript, resetTranscript])

  const speak = (text: string, stepIndex?: number) => {
    if (!synthRef.current) return

    stopSpeaking() // Stop any current speech
    setLastSpokenText(text)

    // Track which step is being spoken
    if (stepIndex !== undefined) {
      setCurrentlySpeakingStepIndex(stepIndex)
      setLastSpokenStepIndex(stepIndex)
    } else {
      setCurrentlySpeakingStepIndex(null)
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      setCurrentlySpeakingStepIndex(null)
      utteranceRef.current = null

      // Restart listening if in continuous mode
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
      Let's begin cooking:
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
      const completionText = "You've completed all steps of this recipe!"
      speak(completionText)
    }
  }

  const readCurrentStep = () => {
    readStep(currentStepIndex)
  }

  const repeatCurrentStep = () => {
    // If currently speaking a step, repeat that step
    if (currentlySpeakingStepIndex !== null) {
      readStep(currentlySpeakingStepIndex)
    }
    // If not currently speaking but we know the last spoken step, repeat it
    else if (lastSpokenStepIndex !== null) {
      readStep(lastSpokenStepIndex)
    }
    // Otherwise, repeat the current step index
    else {
      readCurrentStep()
    }
  }

  const pauseResume = () => {
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
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      setCurrentlySpeakingStepIndex(null)
    }
    if (listening) {
      SpeechRecognition.stopListening()
    }
  }

  const handleClose = () => {
    stopSpeaking()
    setIsActive(false)
    setIsContinuousMode(false)
  }

  const handleUserQuery = async (query: string) => {
    // Check for direct commands first
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

      const assistantResponse = response.choices[0]?.message?.content || "I didn't understand that."
      setConversation((prev) => [...prev, `User: ${query}`, `Assistant: ${assistantResponse}`])
      speak(assistantResponse)
    } catch (error) {
      console.error("Error calling OpenAI:", error)
      speak("Sorry, I encountered an error. Please try again.")
    }
  }

  const handleNextStep = () => {
    // Determine the next step based on what's currently being spoken
    let nextStepIndex: number

    if (currentlySpeakingStepIndex !== null) {
      // If currently speaking a step, next step is the one after the currently speaking step
      nextStepIndex = currentlySpeakingStepIndex + 1
    } else {
      // If not currently speaking, next step is after the current step index
      nextStepIndex = currentStepIndex + 1
    }

    stopSpeaking() // Stop current speech immediately

    if (nextStepIndex < recipe.steps.length) {
      readStep(nextStepIndex)
    } else {
      speak("You've completed all steps!")
    }
  }

  const handlePrevStep = () => {
    // Determine the previous step based on what's currently being spoken
    let prevStepIndex: number

    if (currentlySpeakingStepIndex !== null) {
      // If currently speaking a step, previous step is the one before the currently speaking step
      prevStepIndex = currentlySpeakingStepIndex - 1
    } else {
      // If not currently speaking, previous step is before the current step index
      prevStepIndex = currentStepIndex - 1
    }

    stopSpeaking() // Stop current speech immediately

    if (prevStepIndex >= 0) {
      readStep(prevStepIndex)
    } else {
      speak("This is the first step.")
      readStep(0) // Read the first step
    }
  }

  // const toggleContinuousMode = () => {
  //   if (!isContinuousMode) {
  //     setIsContinuousMode(true)
  //     SpeechRecognition.startListening()
  //   } else {
  //     setIsContinuousMode(false)
  //     if (listening) {
  //       SpeechRecognition.stopListening()
  //     }
  //   }
  // }
  const toggleContinuousMode = () => {
  alert("Coming Soon!");
};


  if (!browserSupportsSpeechRecognition) {
    return <div className="text-red-500">Browser doesn't support speech recognition.</div>
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isActive ? (
        <div className="bg-white rounded-lg shadow-xl p-4 w-80">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Cooking Assistant</h3>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>

          <div className="h-40 overflow-y-auto mb-3 p-2 bg-gray-50 rounded">
            {conversation.map((msg, i) => (
              <div key={i} className="mb-1 text-sm">
                {msg}
              </div>
            ))}
          </div>

          <div className="mb-2">
            <div className="text-sm font-medium mb-1">
              Current Step: {currentStepIndex + 1} of {recipe.steps.length}
              {currentlySpeakingStepIndex !== null && currentlySpeakingStepIndex !== currentStepIndex && (
                <span className="text-blue-600 ml-2">(Speaking: Step {currentlySpeakingStepIndex + 1})</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={repeatCurrentStep} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
              Repeat
            </button>
            <button onClick={handlePrevStep} className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm">
              Previous
            </button>
            <button onClick={handleNextStep} className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm">
              Next
            </button>
            <button onClick={pauseResume} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm">
              {isSpeaking ? "Pause" : "Resume"}
            </button>
            <button onClick={stopSpeaking} className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm">
              Stop
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={toggleContinuousMode}
              className={`px-3 py-1 rounded text-sm ${isContinuousMode ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              Continuous Mode
            </button>
            <span className="text-xs text-gray-500">{isContinuousMode ? "ON" : "OFF"}</span>
          </div>

          <div className="mt-3">
            <button
              onClick={() => SpeechRecognition.startListening()}
              className={`w-full py-2 rounded ${listening ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}
            >
              {listening ? "Listening..." : "Ask Question"}
            </button>
            {transcript && <p className="text-xs mt-1">You said: {transcript}</p>}
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setIsActive(true)
            readRecipe()
          }}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Voice Assistant"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

export default VoiceAssistant

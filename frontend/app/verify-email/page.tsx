"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import { CheckCircle, XCircle, ArrowRight, Home } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const message = searchParams.get("message")
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (success === "true") {
      toast.success(message || "Email verified successfully!")
    } else if (success === "false") {
      toast.error(message || "Verification failed")
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/auth")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [success, message, router])

  const isSuccess = success === "true"

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url("/images/food-background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      <div className="w-full max-w-md bg-amber-50 rounded-xl shadow-lg overflow-hidden z-10 animate-in fade-in duration-500">
        {/* Header */}
        <div className="bg-amber-600 px-6 py-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center animate-in zoom-in duration-500 delay-200">
              <span className="text-amber-600 text-xl font-bold">🍳</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-amber-50 text-center animate-in slide-in-from-top duration-500 delay-300">
            CookMate
          </h1>
          <p className="text-amber-100 text-center mt-2 animate-in slide-in-from-top duration-500 delay-400">
            Email Verification
          </p>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6 animate-in zoom-in duration-700 delay-500">
            {isSuccess ? (
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-600" />
                {/* Success animation ring */}
                <div className="absolute inset-0 w-20 h-20 border-4 border-green-200 rounded-full animate-ping"></div>
              </div>
            ) : (
              <XCircle className="w-20 h-20 text-red-600" />
            )}
          </div>

          {/* Status Title */}
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 animate-in slide-in-from-bottom duration-500 delay-700 ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {isSuccess ? "Email Verified!" : "Verification Failed"}
          </h2>

          {/* Status Message */}
          <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 animate-in slide-in-from-bottom duration-500 delay-900">
            {isSuccess
              ? message || "Your email has been successfully verified. Welcome to CookMate!"
              : message || "There was an error verifying your email. Please try again or contact support."}
          </p>

          {/* Success celebration elements */}
          {isSuccess && (
            <div className="mb-6 animate-in fade-in duration-500 delay-1000">
              <div className="flex justify-center space-x-2 mb-4">
                <span className="text-2xl animate-bounce">🎉</span>
                <span className="text-2xl animate-bounce delay-100">🍳</span>
                <span className="text-2xl animate-bounce delay-200">🎉</span>
              </div>
              <p className="text-amber-600 font-medium">You can now access all CookMate features!</p>
            </div>
          )}

          {/* Countdown */}
          <div className="mb-6 animate-in slide-in-from-bottom duration-500 delay-1100">
            <div className="bg-amber-100 rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-gray-600 mb-2">Redirecting to login page in:</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {countdown}
                </div>
                <span className="text-gray-600">seconds</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 animate-in slide-in-from-bottom duration-500 delay-1200">
            <button
              onClick={() => router.push("/auth")}
              className="w-full bg-amber-600 text-white py-3 px-6 rounded-full font-medium hover:bg-amber-700 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <span>{isSuccess ? "Continue to Login" : "Back to Login"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full border border-amber-600 text-amber-600 py-3 px-6 rounded-full font-medium hover:bg-amber-50 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Homepage</span>
            </button>
          </div>

          {/* Additional help for failed verification */}
          {!isSuccess && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-500 delay-1400">
              <p className="text-sm text-red-700 mb-2">Need help?</p>
              <p className="text-xs text-red-600">
                If you continue to have issues, please contact our support team or try requesting a new verification
                email.
              </p>
            </div>
          )}
        </div>

        {/* Decorative Footer */}
        <div className="bg-amber-100 px-6 py-4">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-amber-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-amber-200 rounded-full opacity-20 animate-pulse z-0 hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-200 rounded-full opacity-20 animate-pulse delay-500 z-0 hidden md:block"></div>
      <div className="absolute top-1/2 left-5 w-16 h-16 bg-amber-300 rounded-full opacity-15 animate-bounce delay-1000 z-0 hidden md:block"></div>
      <div className="absolute top-20 right-20 w-12 h-12 bg-orange-300 rounded-full opacity-25 animate-pulse delay-700 z-0 hidden md:block"></div>

      {/* Success confetti effect */}
      {isSuccess && (
        <>
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-ping delay-500 z-0"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-ping delay-700 z-0"></div>
          <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-orange-400 rounded-full animate-ping delay-1000 z-0"></div>
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-red-400 rounded-full animate-ping delay-1200 z-0"></div>
        </>
      )}
    </div>
  )
}

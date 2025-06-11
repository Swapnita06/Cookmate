"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { verifyEmail } from "../services/api"
import toast from "react-hot-toast"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error("Invalid verification link")
        router.push('/auth')
        return
      }

      try {
        await verifyEmail({ token })
        toast.success("Email verified successfully! You can now log in.")
        router.push('/auth')
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Email verification failed. The link may be invalid or expired.")
        router.push('/auth')
      }
    }

    verifyToken()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
        <p>Please wait while we verify your email address.</p>
      </div>
    </div>
  )
}
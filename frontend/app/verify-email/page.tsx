"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const message = searchParams.get('message')

  useEffect(() => {
    if (success === 'true') {
      toast.success(message || "Email verified successfully!")
      setTimeout(() => router.push('/auth'), 3000)
    } else if (success === 'false') {
      toast.error(message || "Verification failed")
      setTimeout(() => router.push('/auth'), 3000)
    }
  }, [success, message, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {success === 'true' ? (
          <>
            <h1 className="text-2xl font-bold mb-4">Email Verified!</h1>
            <p>You will be redirected to login page shortly.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
            <p>{message || "There was an error verifying your email."}</p>
          </>
        )}
      </div>
    </div>
  )
}
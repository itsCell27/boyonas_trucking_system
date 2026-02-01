import { useEffect, useState, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import { API_BASE_URL } from "@/config"
import { Button } from "@/components/ui/button"

export default function ConfirmEmailChange() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  const hasConfirmed = useRef(false) // GUARD against double execution
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token || hasConfirmed.current) return

    hasConfirmed.current = true

    const confirmEmail = async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/confirm_email_change.php`,
          { token },
          { withCredentials: true }
        )

        toast.success("Email updated", {
          description: "Your email address has been successfully changed.",
        })

        setSuccess(true)
      } catch (error) {
        toast.error("Confirmation failed", {
          description:
            error.response?.data?.error ||
            "This link may have expired or is invalid.",
        })
      } finally {
        setLoading(false)
      }
    }

    confirmEmail()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 sm:p-8 shadow-xl text-center">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">
          Email Confirmation
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Please wait while we confirm your email address."
            : success
            ? "Your email address has been successfully updated."
            : "We were unable to confirm your email address."}
        </p>

        {/* Content */}
        <div className="mt-6">
          {loading && (
            <p className="text-sm text-muted-foreground">
              Confirming email…
            </p>
          )}

          {!loading && success && (
            <>
              <p className="text-sm font-medium text-green-600 mb-4">
                Email change confirmed
              </p>

              <Button
                className="w-full"
                onClick={() => navigate("/login", { replace: true })}
              >
                Go to Login
              </Button>
            </>
          )}

          {!loading && !success && (
            <>
              <p className="text-sm font-medium text-destructive mb-2">
                Confirmation failed
              </p>

              <p className="text-sm text-muted-foreground mb-4">
                The confirmation link may have expired or is invalid.
                Please request a new email change.
              </p>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login", { replace: true })}
              >
                Back to Login
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

import { API_BASE_URL } from "@/config";

export default function ChangeEmailDialog({
  openEmailDialog,
  setOpenEmailDialog,
  onSuccess,
}) {
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!password || !email || !confirmEmail) {
      toast.error("Missing fields", {
        description: "Please fill in all fields.",
      })
      return
    }

    if (email !== confirmEmail) {
      toast.error("Email mismatch", {
        description: "The email addresses do not match.",
      })
      return
    }

    setLoading(true)

    try {
      await axios.post(`${API_BASE_URL}/change_email_request.php`,
        {
          password,
          new_email: email,
        },
        {
          withCredentials: true,
        }
      )

      toast.success("Verification sent", {
        description: "Check your new email to confirm the change.",
      })

      onSuccess?.()
      setOpenEmailDialog(false)

      // Reset fields
      setPassword("")
      setEmail("")
      setConfirmEmail("")
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Something went wrong"

      toast.error("Request failed", {
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={openEmailDialog} onOpenChange={setOpenEmailDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Email Address</DialogTitle>
          <DialogDescription>
            For security, confirm your password and enter your new email.
            We’ll send a verification link to the new email before applying the change.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="grid gap-2">
            <Label>New email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Confirm new email</Label>
            <Input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpenEmailDialog(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                Sending...
              </span>
            ) : (
              "Send verification"
            )
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

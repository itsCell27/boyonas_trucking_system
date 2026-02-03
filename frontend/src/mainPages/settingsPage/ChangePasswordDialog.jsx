import { useState } from "react"
import { Eye, EyeOff, Check, X } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { API_BASE_URL } from "@/config"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

export default function ChangePasswordDialog({
  openPasswordDialog,
  setOpenPasswordDialog,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // ✅ SAME PASSWORD RULES AS ResetPassword.jsx
  const passwordChecks = {
    minLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
  }

  const allChecksPassed = Object.values(passwordChecks).every(Boolean)
  const passwordsMatch = newPassword === confirmPassword

  const handleSubmit = async () => {
    if (!allChecksPassed) {
      toast.error("Please meet all password requirements")
      return
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const res = await axios.post(
        `${API_BASE_URL}/change_password.php`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        { withCredentials: true }
      )

      toast.success(res.data.message || "Password changed successfully")

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setOpenPasswordDialog(false)
      onSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={openPasswordDialog} onOpenChange={setOpenPasswordDialog}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Your new password must meet all security requirements.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          {/* Current Password */}
          <Field>
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={show.current ? "text" : "password"}
                value={currentPassword}
                placeholder="Enter current password"
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <ToggleEye
                open={show.current}
                onClick={() => setShow({ ...show, current: !show.current })}
              />
            </div>
          </Field>

          {/* New Password */}
          <Field>
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={show.new ? "text" : "password"}
                value={newPassword}
                placeholder="Enter new password"
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <ToggleEye
                open={show.new}
                onClick={() => setShow({ ...show, new: !show.new })}
              />
            </div>

            {newPassword && (
              <div className="mt-3 space-y-1 text-xs">
                <PasswordRequirement met={passwordChecks.minLength} text="At least 8 characters" />
                <PasswordRequirement met={passwordChecks.hasUpperCase} text="One uppercase letter" />
                <PasswordRequirement met={passwordChecks.hasLowerCase} text="One lowercase letter" />
                <PasswordRequirement met={passwordChecks.hasNumber} text="One number" />
                <PasswordRequirement met={passwordChecks.hasSpecialChar} text="One special character" />
              </div>
            )}
          </Field>

          {/* Confirm Password */}
          <Field>
            <Label>Confirm New Password</Label>
            <div className="relative">
              <Input
                type={show.confirm ? "text" : "password"}
                value={confirmPassword}
                placeholder="Confirm new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <ToggleEye
                open={show.confirm}
                onClick={() => setShow({ ...show, confirm: !show.confirm })}
              />
            </div>

            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <X size={14} /> Passwords do not match
              </p>
            )}
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>Cancel</Button>
          </DialogClose>

          <Button
            onClick={handleSubmit}
            disabled={loading || !allChecksPassed || !passwordsMatch}
          >
            {loading ? <Spinner className="h-4 w-4" /> : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Helpers ---------- */

function ToggleEye({ open, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
    >
      {open ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  )
}

function PasswordRequirement({ met, text }) {
  return (
    <div className={`flex items-center gap-2 ${met ? "text-green-600" : "text-muted-foreground"}`}>
      {met ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  )
}

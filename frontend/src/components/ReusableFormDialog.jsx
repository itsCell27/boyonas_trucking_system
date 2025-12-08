import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ReusableFormDialog({
  title,
  description,
  triggerLabel = null,
  submitLabel = "Submit",
  fields,
  onSubmit,
  open,
  onOpenChange,
  setToastMessage = false,
}) {
  const [loading, setLoading] = useState(false)

  const isControlled = open !== undefined && onOpenChange !== undefined

  const closeDialog = () => {
    if (isControlled) {
      onOpenChange(false)
    } else {
      document.getElementById("auto-close-dialog")?.click()
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const values = {}

    for (const [key, value] of formData.entries()) {
      values[key] = value
    }

    setLoading(true)

    try {
      await onSubmit(values)

      if (setToastMessage){
        toast.success(`${title} completed successfully`)
      } 

      closeDialog()
    } catch (error) {
      if (setToastMessage) {
        toast.error("Something went wrong.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerLabel && (
        <DialogTrigger asChild>
          <Button variant="outline">{triggerLabel}</Button>
        </DialogTrigger>
      )}

      {/* Auto-close for uncontrolled mode */}
      <DialogClose id="auto-close-dialog" className="hidden" />

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            {fields.map((field) => {
              const key = field.name || field.id

              return (
                <div key={key} className="grid gap-2">
                  <Label htmlFor={field.id}>{field.label}</Label>

                  <Input
                    id={field.id}
                    name={key}
                    type={field.type || "text"}
                    defaultValue={field.defaultValue}
                    placeholder={field.placeholder}
                  />
                </div>
              )
            })}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, FileText, X } from "lucide-react";

const DOCUMENT_TYPES = [
  "Before Move Photos",
  "After Move Photos",
  "Customer ID",
  "Contract / Agreement",
  "Payment Receipt",
  "Other",
];

export default function UploadDocumentLipatBahay({
  open,
  onOpenChange,
  bookingId,
  assignmentId = null,
  onUploadSuccess,
  axios,
  API_BASE_URL,
  toast,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("Before Move Photos");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed.");
      return;
    }

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("document_type", documentType);
      formData.append("booking_id", bookingId);

      if (assignmentId) {
        formData.append("assignment_id", assignmentId);
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/upload_booking_document.php`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data?.success) {
        toast.success("Document uploaded!");
        clearFile();
        setDocumentType("Before Move Photos");
        onOpenChange(false);

        if (onUploadSuccess) onUploadSuccess();
      } else {
        toast.error(data?.error || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err?.response?.data?.error || "Server error.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Upload Lipat Bahay Document</DialogTitle>
          <DialogDescription>
            Booking ID: {bookingId}
          </DialogDescription>
        </DialogHeader>

        {/* Document Type */}
        <div className="space-y-3 pt-3">
          <Label>Document Type *</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload Field */}
        <div className="space-y-3">
          <Label>File *</Label>

          {!selectedFile ? (
            <div className="border-2 border-dashed p-6 rounded-lg text-center">
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="lb-upload"
              />
              <Label htmlFor="lb-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                Click to upload or drag a file here
              </Label>
            </div>
          ) : (
            <div className="border rounded-lg p-4 flex items-center gap-3">
              {previewUrl ? (
                <img src={previewUrl} className="w-16 h-16 rounded object-cover" />
              ) : (
                <FileText className="h-10 w-10 text-muted-foreground" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>

              <Button variant="ghost" size="sm" onClick={clearFile} disabled={uploading}>
                <X />
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

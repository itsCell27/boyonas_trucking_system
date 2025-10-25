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
  "Delivery Receipt",
  "Cargo Photo",
  "Waybill",
  "Invoice",
  "Packing List",
  "Other",
];

export default function UploadDocumentBooking({ 
  open, 
  onOpenChange, 
  bookingId, 
  assignmentId = null,
  onUploadSuccess,
  axios,
  API_BASE_URL,
  toast
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("Delivery Receipt");
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

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
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
      toast.error("Please select a file to upload.");
      return;
    }

    if (!documentType) {
      toast.error("Please select a document type.");
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
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data?.success) {
        toast.success("Document uploaded successfully!");
        clearFile();
        setDocumentType("Delivery Receipt");
        onOpenChange(false);
        
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        toast.error(data?.error || "Failed to upload document.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error?.response?.data?.error || "Server error uploading document."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      clearFile();
      setDocumentType("Delivery Receipt");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document for Booking ID: {bookingId}
            {assignmentId && ` (Assignment ID: ${assignmentId})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
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

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">File *</Label>
            <div className="space-y-3">
              {!selectedFile ? (
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-primary">
                        Click to upload
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {" "}or drag and drop
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG, or PDF (max. 5MB)
                    </span>
                  </Label>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-muted grid place-items-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFile}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Supported formats: JPG, PNG, PDF. Maximum file size: 5MB
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
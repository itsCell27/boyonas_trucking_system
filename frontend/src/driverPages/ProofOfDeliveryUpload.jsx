import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

export default function ProofOfDeliveryUpload({ assignmentId, onUploaded, status }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Allowed client-side validation
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  const MAX_SIZE_MB = 8;

  const onFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Invalid file type. Allowed: JPG, JPEG, PNG, PDF");
      return;
    }

    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    setFile(f);

    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null); // PDF placeholder
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (status === "Pending") return toast.error("Start the delivery before uploading proof");

    if (!assignmentId) return toast.error("Assignment ID missing");
    if (!file) return toast.error("Please upload a file");

    const fd = new FormData();
    fd.append("assignment_id", assignmentId);
    fd.append("notes", notes);
    fd.append("proof", file);

    setLoading(true);
    try {
      const resp = await axios.post(`${API_BASE_URL}/driver/upload_proof.php`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!resp.data.success) {
        toast.error(resp.data.message || "Upload failed");
        return;
      }

      toast.success("Proof uploaded!");
      setFile(null);
      setPreview(null);
      setNotes("");
      if (typeof onUploaded === "function") onUploaded(resp.data);

    } catch (err) {
      console.error(err);
      toast.error("Upload error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Upload Proof of Delivery</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <label htmlFor="file-input" className="block border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm font-medium">Click to upload file</p>
          <p className="text-xs text-gray-500">Allowed: JPG, JPEG, PNG, PDF</p>

          <input
            id="file-input"
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={onFileSelect}
            className="sr-only"
          />

          <Button variant="outline" type="button" className="mt-3 pointer-events-none">
            Select File
          </Button>
        </label>

        {/* Preview */}
        {file && (
          <div className="relative border rounded-lg p-3">
            {preview ? (
              <img src={preview} className="w-full h-fit object-cover rounded-md" />
            ) : (
              <div className="h-32 flex items-center justify-center bg-gray-200 rounded-md">
                PDF File Selected
              </div>
            )}

            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Notes (optional)</label>
          <Input
            placeholder="Add notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Submit */}
        <Button className="w-full" disabled={loading} onClick={submit}>
          {loading ? "Uploading…" : "Submit Proof"}
        </Button>
      </CardContent>
    </Card>
  );
}

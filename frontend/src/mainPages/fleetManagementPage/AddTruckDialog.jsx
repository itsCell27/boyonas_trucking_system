"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner"

export default function AddTruckDialog({ onClose }) {

  const CURRENT_YEAR = new Date().getFullYear();
  const MIN_CAPACITY_KG = 100;
  const MAX_CAPACITY_KG = 50000;

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    plate_number: "",
    model: "",
    capacity: "",
    year: "",
    or_document: null,
    or_expiry_date: "",
    cr_document: null,
    cr_expiry_date: "",
    status: "",
    image: null,
    remarks: "",
  });

  // Handle form input changes + file validation
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      if (name === "image") {
        if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
          alert("Only JPG, PNG, and GIF images are allowed.");
          e.target.value = null;
          return;
        }
      } else if (name === "or_document" || name === "cr_document") {
        if (
          ![
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
          ].includes(file.type)
        ) {
          alert("Only PDF, DOC, DOCX, JPG, and PNG files are allowed for documents.");
          e.target.value = null;
          return;
        }
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
    } else {
      if (name === "capacity") {
        if (value < 0) {
          alert("Capacity cannot be negative.");
          e.target.value = "";
          return;
        }
      }
      if (name === "year") {
        if (value.length > 4) {
          alert("Year cannot be more than 4 digits.");
          e.target.value = value.slice(0, 4);
          return;
        }
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle submit to PHP backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentYear = new Date().getFullYear();
    const capacity = Number(formData.capacity);

    if (!Number.isInteger(Number(formData.year))) {
      toast.error("Year model must be a valid number.");
      return;
    }

    if (formData.year.length < 4) {
      toast.error("Year must be 4 digits.");
      return;
    }

    if (formData.year > currentYear) {
      toast.error(`Year model cannot be later than ${currentYear}.`);
      return;
    }

    if (formData.year < 1900) {
      toast.error("Year model is too old to be valid.");
      return;
    }

    if (!Number.isFinite(capacity) || capacity < 100) {
      toast.error("Truck capacity must be at least 100 kg.");
      return;
    }

    if (capacity > 50000) {
      toast.error("Truck capacity is unrealistically high.");
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/add_truck.php`, {
        method: "POST",
        credentials: "include",
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        alert("Truck added successfully!");
        setFormData({
          plate_number: "",
          model: "",
          capacity: "",
          year: "",
          or_document: null,
          or_expiry_date: "",
          cr_document: null,
          cr_expiry_date: "",
          image: null,
          remarks: "",
        });
        setStep(1);
        setOpen(false);
        if (onClose) onClose();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while adding the truck.");
    }
  };

  // Step validation
  const isStep1Valid =
    formData.plate_number && formData.model && formData.capacity && formData.year;
  const isStep2Valid =
    formData.or_document && formData.cr_document && formData.or_expiry_date && formData.cr_expiry_date;

  return (
    <Dialog open={open} onOpenChange={setOpen} className="rounded-xl">
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline-flex">Add Truck</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-[95vw] md:max-w-[60vw] lg:max-w-[40vw] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Add New Truck</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter the truck details to add it to the fleet"
              : "Upload truck documents (OR, CR)"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="text-sm font-medium">Plate Number</label>
                <Input
                  name="plate_number"
                  placeholder="ABC 1234"
                  maxLength={8}
                  value={formData.plate_number}
                  onChange={(e) => {
                    const value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9 ]/g, "")
                      .replace(/\s+/g, " ");
                    setFormData({...formData, plate_number: value});
                  }}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Model</label>
                <Input
                  name="model"
                  placeholder="Isuzu Forward"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Capacity (kg)</label>
                <Input
                  name="capacity"
                  type="number"
                  placeholder="5000"
                  min="100"
                  max="50000"
                  step="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Year</label>
                <Input
                  name="year"
                  type="number"
                  placeholder="2024"
                  min="1900"
                  max={CURRENT_YEAR}
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex justify-between max-w gap-6 flex-col sm:flex-row">
                <div>
                    <label className="text-sm font-medium">Image (optional)</label>
                    <Input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Remarks (Optional)</label>
                <Input
                  name="remarks"
                  placeholder="Any additional notes..."
                  value={formData.remarks}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 gap-2"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Upload OR and CR Documents */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <label className="text-sm font-medium block mb-2">OR Document</label>
                  <input
                    type="file"
                    name="or_document"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    className="w-full text-sm border p-3 rounded-lg"
                  />
                  <label className="text-sm font-medium block mt-3 mb-2">OR Expiry Date</label>
                  <Input
                    type="date"
                    name="or_expiry_date"
                    value={formData.or_expiry_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <label className="text-sm font-medium block mb-2">CR Document</label>
                  <input
                    type="file"
                    name="cr_document"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    className="w-full text-sm border p-3 rounded-lg"
                  />
                  <label className="text-sm font-medium block mt-3 mb-2">CR Expiry Date</label>
                  <Input
                    type="date"
                    name="cr_expiry_date"
                    value={formData.cr_expiry_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-2 bg-transparent"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button type="submit" className="flex-1" disabled={!isStep2Valid}>
                  Add Truck
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

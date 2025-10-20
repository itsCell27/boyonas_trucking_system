"use client";

import React, { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function AddEmployeeDialog({ onClose }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    position: "",
    contact_number: "",
    status: "Idle",
    license_info: "",
    date_started: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    employee_code: "",
    nbi_clearance: "",
    nbi_expiry_date: "",
    police_clearance: "",
    police_expiry_date: "",
  });

  // Handle form input changes + file validation
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      if (name === "nbi_clearance" || name === "police_clearance") {
        if (
          !["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"].includes(file.type)
        ) {
          alert("Only PDF, DOC, DOCX, JPG, and PNG files are allowed for documents.");
          e.target.value = null;
          return;
        }
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle submit to PHP backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const response = await fetch("http://localhost/react_trucking_system/backend/api/add_employee.php", {
        method: "POST",
        credentials: "include",
        body: data,
      });

      const responseText = await response.text();
      console.log(responseText);
      const result = JSON.parse(responseText);

      if (response.ok) {
        alert("Employee added successfully!");
        setFormData({
            full_name: "",
            email: "",
            position: "",
            contact_number: "",
            status: "Idle",
            license_info: "",
            date_started: "",
            emergency_contact_name: "",
            emergency_contact_number: "",
            employee_code: "",
            nbi_clearance: "",
            nbi_expiry_date: "",
            police_clearance: "",
            police_expiry_date: "",
        });
        setOpen(false);
        if (onClose) onClose();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while adding the employee.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.full_name &&
    formData.email &&
    formData.position &&
    formData.contact_number &&
    formData.date_started &&
    formData.emergency_contact_name &&
    formData.emergency_contact_number &&
    formData.employee_code &&
    formData.nbi_clearance &&
    formData.nbi_expiry_date &&
    formData.police_clearance &&
    formData.police_expiry_date;

  return (
    <Dialog open={open} onOpenChange={setOpen} className="rounded-xl">
        <DialogTrigger asChild>
            <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
            </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md overflow-y-auto max-h-[80vh]">
            <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
                Enter the employee details to add them to the system
            </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                            name="full_name"
                            placeholder="Juan Dela Cruz"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            name="email"
                            type="email"
                            placeholder="juan.delacruz@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Position</label>
                        <Select
                            value={formData.position}
                            onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, position: value }))
                            }
                        >
                            <SelectTrigger>
                            <SelectValue placeholder="Select Position" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Driver">Driver</SelectItem>
                            <SelectItem value="Helper">Helper</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Date Started</label>
                        <Input
                            name="date_started"
                            type="date"
                            value={formData.date_started}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Employee Code</label>
                        <Input
                            name="employee_code"
                            placeholder="DRV-001"
                            value={formData.employee_code}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Contact Number</label>
                        <Input
                            name="contact_number"
                            placeholder="09123456789"
                            value={formData.contact_number}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {formData.position === "Driver" && (
                        <div className="col-span-2">
                            <label className="text-sm font-medium">License Info</label>
                            <Input
                            name="license_info"
                            placeholder="License No. D123456"
                            value={formData.license_info}
                            onChange={handleChange}
                            />
                        </div>
                    )}
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Emergency Contact Name</label>
                        <Input
                            name="emergency_contact_name"
                            placeholder="Maria Dela Cruz"
                            value={formData.emergency_contact_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Emergency Contact Number</label>
                        <Input
                            name="emergency_contact_number"
                            placeholder="09123456789"
                            value={formData.emergency_contact_number}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="border rounded-lg p-4 col-span-2">
                        <label className="text-sm font-medium block mb-2">NBI Clearance</label>
                        <Input
                            type="file"
                            name="nbi_clearance"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleChange}
                            className="w-full text-sm border p-3 rounded-lg"
                        />
                        <label className="text-sm font-medium block mt-3 mb-2">NBI Expiry Date</label>
                        <Input
                            type="date"
                            name="nbi_expiry_date"
                            value={formData.nbi_expiry_date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="border rounded-lg p-4 col-span-2">
                        <label className="text-sm font-medium block mb-2">Police Clearance</label>
                        <Input
                            type="file"
                            name="police_clearance"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleChange}
                            className="w-full text-sm border p-3 rounded-lg"
                        />
                        <label className="text-sm font-medium block mt-3 mb-2">Police Expiry Date</label>
                        <Input
                            type="date"
                            name="police_expiry_date"
                            value={formData.police_expiry_date}
                            onChange={handleChange}
                        />
                    </div>
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
                    <Button type="submit" className="flex-1" disabled={!isFormValid || loading}>
                        {loading ? <Spinner /> : "Add Employee"}
                    </Button>
                </div>
            </form>
        </DialogContent>
    </Dialog>
  );
}
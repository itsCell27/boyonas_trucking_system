import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, ArrowLeft } from "lucide-react"
import axios from "axios"
import { API_BASE_URL } from "../../config"
import AssignmentPage from "./AssignmentPage"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner";

export default function CreatePartnershipBooking() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    service_type: "Partnership",
    dr_number: "",
    partner_name: "SPX Express",
    route_from: "",
    route_to: "",
    scheduled_start: "",
    deadline: "",
    estimated_weight: "",
    category: "",
    status: "Pending Assignment",
    created_by: 1,
  })

  // capacity states
  const [maxCapacity, setMaxCapacity] = useState(null)      // NEW
  const [isWeightValid, setIsWeightValid] = useState(true)  // NEW

  // Fetch the highest available truck capacity once (or every time step becomes 2)
  useEffect(() => {
    // fetch when the user moves to step 2
    if (step !== 2) return;

    const fetchCapacity = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/find_highest_capacity_truck.php`, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });

        if (res.data && res.data.success) {
          setMaxCapacity(res.data.max_capacity || 0);
          // Re-validate current estimated weight if present
          if (formData.estimated_weight) {
            setIsWeightValid(Number(formData.estimated_weight) <= (res.data.max_capacity || 0));
          }
        } else {
          setMaxCapacity(0);
          console.warn("Could not get max capacity", res.data);
        }
      } catch (err) {
        console.error(err);
        setMaxCapacity(0);
      }
    }

    fetchCapacity();
  }, [step]); // fetch when step changes to 2

  // Update handleInputChange to validate estimated_weight
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // maintain original behavior
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // if estimated_weight changed -> validate
    if (name === "estimated_weight") {
      const num = Number(value);
      if (Number.isNaN(num) || num < 0) {
        setIsWeightValid(false);
        return;
      }
      if (maxCapacity === null) {
        // capacity not loaded yet — optimistic allow but warn
        setIsWeightValid(true);
      } else {
        setIsWeightValid(num <= Number(maxCapacity));
      }
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.partner_name || !formData.route_from || !formData.route_to) {
        alert("Please fill in all required fields")
        return
      }
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.scheduled_start || !formData.deadline || !formData.estimated_weight) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (maxCapacity !== null && Number(formData.estimated_weight) > Number(maxCapacity)) {
      toast.error(`Estimated weight exceeds the max available truck capacity (${maxCapacity} kg).`);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/create_partnership_bookings.php`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 409 || response.data.error) {
        toast.error(response.data.error || "DR Number already exists.");
        return;
      }

      if (response.data.success) {
        toast.success(`Booking #${response.data.booking_id} created successfully!`);
        navigate(`/app/assignment/${response.data.booking_id}`, {
          state: { fromCreateDelivery: true }
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Server error while creating booking."
      );
    }
  };

  const categories = ["Electronics", "Construction Materials", "Furniture", "Appliances", "General Cargo"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Partnership Booking</h1>
          <p className="text-muted-foreground">Step {step} of 2</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`}></div>
          <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
              <CardDescription>Enter the partnership booking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="partner_name">Partner Name *</Label>
                <Input
                  id="partner_name"
                  name="partner_name"
                  placeholder="e.g., SPX Express"
                  value={formData.partner_name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="route_from">Route From *</Label>
                <Input
                  id="route_from"
                  name="route_from"
                  placeholder="e.g., SOC Warehouse - Quezon City"
                  value={formData.route_from}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="route_to">Route To *</Label>
                <Input
                  id="route_to"
                  name="route_to"
                  placeholder="e.g., Client Site - Makati"
                  value={formData.route_to}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>

                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: "category", value }
                    })
                  }
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Schedule & Weight */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Cargo Details</CardTitle>
              <CardDescription>Set the delivery schedule and cargo information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dr_number">DR Number *</Label>
                <Input
                  id="rdr_number"
                  name="dr_number"
                  placeholder="DEL-001"
                  value={formData.dr_number}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_start">Scheduled Start *</Label>
                <Input
                  id="scheduled_start"
                  name="scheduled_start"
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_weight">Estimated Weight (kg) *</Label>
                <Input
                  id="estimated_weight"
                  name="estimated_weight"
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.estimated_weight}
                  onChange={handleInputChange}
                  min={0}
                />
                <p className={`text-sm mt-1 ${isWeightValid ? "text-muted-foreground" : "text-red-500"}`}>
                  {maxCapacity === null
                    ? "Checking available truck capacity..."
                    : (maxCapacity === 0
                        ? "No trucks currently available."
                        : `Highest truck capacity: ${maxCapacity} kg`
                  )}
                </p>
                {!isWeightValid && (
                  <p className="text-sm text-red-500">Estimated weight exceeds the current max available truck capacity.</p>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={!isWeightValid || (maxCapacity === 0)}>
                  Create & Assign Driver
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
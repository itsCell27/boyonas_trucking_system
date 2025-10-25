import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, ArrowLeft } from "lucide-react"
import axios from "axios"
import { API_BASE_URL } from "../../config"
import AssignmentPage from "./AssignmentPage"
import { toast } from "sonner";

export default function CreatePartnershipBooking() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    service_type: "Partnership",
    dr_number: "",
    partner_name: "",
    route_from: "",
    route_to: "",
    scheduled_start: "",
    deadline: "",
    estimated_weight: "",
    category: "",
    status: "Pending Assignment",
    created_by: 1,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
        navigate(`/app/assignment/${response.data.booking_id}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Server error while creating booking."
      );
    }
  };

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
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Construction Materials">Construction Materials</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Appliances">Appliances</option>
                  <option value="General Cargo">General Cargo</option>
                </select>
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
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button className="flex-1" onClick={handleSubmit}>
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
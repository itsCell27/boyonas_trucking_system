import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

export default function CreateLipatBahayBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    service_type: "LipatBahay",
    dr_number: "",          
    customer_name: "",
    phone_number: "",
    route_from: "",
    route_to: "",
    scheduled_start: "",
    deadline: "",
    estimated_weight: "",
    service_rate: "",
    status: "Pending Assignment",
    created_by: 1,
  });

  const [errors, setErrors] = useState({
    schedule: "",
    deadline: "",
  });


  const [maxCapacity, setMaxCapacity] = useState(null);
  const [isWeightValid, setIsWeightValid] = useState(true);

  const isFormInvalid =
  errors.schedule !== "" ||
  errors.deadline !== "" ||
  !formData.scheduled_start ||
  !formData.deadline ||
  !formData.estimated_weight ||
  !formData.customer_name ||
  !formData.phone_number ||
  !formData.service_rate ||
  (formData.service_rate !== undefined && formData.service_rate === "");


  useEffect(() => {
    if (step !== 2) return;

    const fetchCapacity = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/find_highest_capacity_truck.php`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setMaxCapacity(res.data.max_capacity || 0);
        } else {
          setMaxCapacity(0);
        }
      } catch (err) {
        console.error(err);
        setMaxCapacity(0);
      }
    };

    fetchCapacity();
  }, [step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "estimated_weight") {
      const num = Number(value);
      if (!maxCapacity) {
        setIsWeightValid(true);
        return;
      }
      setIsWeightValid(num <= Number(maxCapacity));
    }
  };

  const handleNext = () => {
    if (!formData.customer_name || !formData.phone_number || !formData.route_from || !formData.route_to) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.dr_number || !formData.scheduled_start || !formData.deadline || !formData.estimated_weight || !formData.service_rate) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (formData.dr_number.includes("DEL")) {
      toast.error("DR Number cannot contain 'DEL'");
      return;
    }

    if (!formData.dr_number.startsWith("LB-")) {
      toast.error("DR Number must start with 'LB-'");
      return;
    }

    const start = new Date(formData.scheduled_start);
    const deadline = new Date(formData.deadline);
    const now = new Date();

    if (start < now) {
      toast.error("Scheduled start cannot be in the past.");
      return;
    }

    if (deadline <= start) {
      toast.error("Deadline must be after the scheduled start.");
      return;
    }

    if (Number(formData.estimated_weight) > Number(maxCapacity)) {
      toast.error(`Estimated weight exceeds current max truck capacity (${maxCapacity} kg).`);
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/create_lipatbahay_booking.php`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.error) {
        toast.error(res.data.error);
        return;
      }

      if (res.data.success) {
        toast.success(`Booking #${res.data.booking_id} created successfully!`);
        navigate(`/app/assignment_lipatbahay/${res.data.booking_id}`, {
          state: { fromCreateDelivery: true },
        });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(err.response.data.error);
        return;
      }

      toast.error("Server error while creating booking.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Lipat Bahay Booking</h1>
          <p className="text-muted-foreground">Step {step} of 2</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`}></div>
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Enter the Lipat Bahay booking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input
                  name="customer_name"
                  placeholder="e.g., Juan Dela Cruz"
                  value={formData.customer_name}
                  onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, "");
                      setFormData({ ...formData, customer_name: value });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  name="phone_number"
                  placeholder="e.g., 09123456789"
                  value={formData.phone_number}
                  onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9+\-\s()]/g, "");
                      setFormData({ ...formData, phone_number: value });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Route From *</Label>
                <Input
                  name="route_from"
                  placeholder="e.g., Novaliches, QC"
                  value={formData.route_from}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Route To *</Label>
                <Input
                  name="route_to"
                  placeholder="e.g., Pasig City"
                  value={formData.route_to}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
                <Button className="flex-1" onClick={handleNext}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Cargo</CardTitle>
              <CardDescription>Set delivery schedule and estimated cargo weight</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">

              {/* DR Number */}
              <div className="space-y-2">
                <Label>DR Number *</Label>
                <Input
                  name="dr_number"
                  placeholder="LB-001"
                  value={formData.dr_number}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Scheduled Start *</Label>
                <Input
                  type="datetime-local"
                  name="scheduled_start"
                  value={formData.scheduled_start}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, scheduled_start: value });

                    const start = new Date(value);
                    const now = new Date();

                    let newErrors = { ...errors };

                    // Compare only the date portion (ignore time)
                    const startDay = new Date(
                      start.getFullYear(),
                      start.getMonth(),
                      start.getDate()
                    );
                    const today = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate()
                    );

                    if (startDay < today) {
                      newErrors.schedule = "Start date cannot be before today.";
                    } else {
                      newErrors.schedule = "";
                    }

                    if (formData.deadline) {
                      const deadline = new Date(formData.deadline);
                      newErrors.deadline =
                        deadline <= start ? "Deadline must be after the start date & time." : "";
                    }

                    setErrors(newErrors);
                  }}
                />
                {errors.schedule && (
                  <p className="text-destructive text-sm mt-1">{errors.schedule}</p>
                )}

              </div>

              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Input
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, deadline: value });

                    const start = new Date(formData.scheduled_start);
                    const deadline = new Date(value);

                    let newErrors = { ...errors };

                    newErrors.deadline =
                      deadline <= start ? "Deadline must be after the start date & time." : "";

                    setErrors(newErrors);
                  }}

                />
                {errors.deadline && (
                  <p className="text-destructive text-sm mt-1">{errors.deadline}</p>
                )}

              </div>

              <div className="space-y-2">
                <Label>Estimated Weight (kg) *</Label>
                <Input
                  type="number"
                  name="estimated_weight"
                  placeholder="e.g., 3000"
                  value={formData.estimated_weight}
                  onChange={handleInputChange}
                />

                <p className="text-sm text-muted-foreground mt-1">
                  {maxCapacity === null
                    ? "Checking truck capacity..."
                    : maxCapacity === 0
                      ? "No available trucks."
                      : `Max truck capacity: ${maxCapacity} kg`}
                </p>

                {!isWeightValid && (
                  <p className="text-sm text-red-500">
                    Estimated weight exceeds available truck capacity.
                  </p>
                )}
              </div>

              {/* SERVICE RATE */}
              <div className="space-y-2">
                <Label>Service Rate (₱)</Label>
                <Input
                  type="number"
                  name="service_rate"
                  placeholder="e.g., 3500"
                  value={formData.service_rate}
                  onChange={handleInputChange}
                />
              </div>


              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="flex-1" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={!isWeightValid || maxCapacity === 0 || isFormInvalid}
                >
                  Create & Assign Driver
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

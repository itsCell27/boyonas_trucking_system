import { useState } from "react";
import { Eye, EyeOff, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

export default function Test() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/login.php`,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
          timeout: 8000,
        }
      );

      const data = response.data;

      if (data.success) {
        if (data.user.role_name === "admin") {
            // Set authentication BEFORE navigating
            localStorage.setItem("isAuthenticated", "true");

            // Use replace to avoid back button issues
            navigate("/app/dashboard", { replace: true });
        } else {
            toast.error("Only admin users can access this system.");
        }
      } else {
            toast.error(data.message || "An unknown error occurred.");
      }
    } catch (error) {
        console.error("Login error:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Invalid credentials.");
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("Request failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col md:flex-row justify-center min-h-screen w-full bg-muted text-foreground overflow-y-auto p-4">
      {/* Mobile Header */}
      <div className="flex flex-col md:hidden justify-center items-center w-full md:w-1/2 p-8 text-center">
        <div className="p-4 mb-4 bg-primary rounded-full text-background dark:text-foreground">
          <Truck size={30} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Boyonas Trucking</h1>
        <p>Management System</p>
      </div>

      <Card className="flex flex-col md:flex-row w-full max-w-[85vw] sm:max-w-[80vw] lg:max-w-[60vw] xl:max-w-[60vw] 2xl:max-w-[60vw] rounded-2xl overflow-hidden shadow-xl border border-border p-0 gap-0">
        {/* Left Section */}
        <div className="md:flex flex-col hidden justify-center items-center w-full md:w-1/2 p-8 text-center bg-card">
          <div className="p-6 bg-transparent text-primary">
            <Truck size={80} />
          </div>
          <h1 className="text-lg sm:text-2xl xl:text-4xl font-bold mb-2 text-primary">Boyonas Trucking</h1>
          <p>Management System</p>
        </div>

        {/* Right Section (Login Form) */}
        <CardContent className="w-full md:w-1/2 flex flex-col justify-center bg-background p-6 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Login</h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="flex flex-col items-start">
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full text-sm"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col items-start">
              <label className="block text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative w-full">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pr-10 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center mt-1">{error}</p>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full font-medium text-white" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Forgot Password */}
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => navigate("/forgot_password")}
              disabled={loading}
            >
              Forgot Password?
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

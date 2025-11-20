/* Replace your src/pages/ForgotPassword.jsx with this */
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Form submitted"); // Debug log
    console.log("Email:", email); // Debug log
    console.log("API URL:", `${API_BASE_URL}/forgot_password.php`); // Debug log
    
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Sending request..."); // Debug log
      
      const res = await axios.post(
        `${API_BASE_URL}/forgot_password.php`, 
        { email }, 
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      console.log("Response received:", res.data); // Debug log
      toast.success(res.data?.message || "A reset link has been sent to your email.");
      
    } catch (err) {
      console.error("Full error object:", err); // Debug log
      console.error("Error response:", err?.response); // Debug log
      console.error("Error data:", err?.response?.data); // Debug log
      
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message;
      toast.error(serverMsg || "Failed to send reset email. Check console for details.");
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col md:flex-row justify-center min-h-screen w-full bg-muted text-foreground overflow-y-auto p-4">
      <Card className="flex flex-col w-full max-w-[85vw] sm:max-w-[45vw] md:max-w-[40vw] lg:max-w-[50vw] xl:max-w-[40vw] 2xl:max-w-[30vw] rounded-2xl overflow-hidden shadow-xl border border-border p-0 gap-0">
        <CardContent className="w-full flex flex-col justify-center bg-background p-6 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Forgot Password</h2>

          <form className="flex flex-col gap-4 mb-2" onSubmit={handleSubmit}>
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

            <Button type="submit" className="w-full font-medium text-white" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2"><Spinner /> Sending...</span>
              ) : "Send"}
            </Button>

            
          </form>
          <Button variant="link" onClick={() => navigate("/login")} disabled={loading}>
              Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

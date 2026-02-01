import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get('token');
    const navigate = useNavigate();
    
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    // Password validation checks
    const passwordChecks = {
        minLength: newPassword.length >= 8,
        hasUpperCase: /[A-Z]/.test(newPassword),
        hasLowerCase: /[a-z]/.test(newPassword),
        hasNumber: /\d/.test(newPassword),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    };

    const allChecksPassed = Object.values(passwordChecks).every(check => check);

    // Validate token on component mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                toast.error('No reset token provided');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.post(
                    `${API_BASE_URL}/verify_reset_token.php`,
                    { token },
                    { headers: { "Content-Type": "application/json" } }
                );

                if (response.data.valid) {
                    setTokenValid(true);
                } else {
                    toast.error('Invalid or expired reset link');
                    setTimeout(() => navigate('/login'), 2000);
                }
            } catch (error) {
                console.error('Token validation error:', error);
                toast.error(error?.response?.data?.error || 'Invalid or expired reset link');
                setTimeout(() => navigate('/login'), 2000);
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!allChecksPassed) {
            toast.error('Please meet all password requirements');
            return;
        }
        
        if (newPassword !== confirm) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        
        try {
            const response = await axios.post(
                `${API_BASE_URL}/reset_password.php`,
                { token, new_password: newPassword },
                { headers: { "Content-Type": "application/json" } }
            );
            
            toast.success('Password updated successfully! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('Reset password error:', err);
            toast.error(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while validating token
    if (validating) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted">
                <Card className="w-full max-w-md p-6">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Validating reset link...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Only render form if token is valid
    if (!tokenValid) {
        return null;
    }

    return (
        <div className="flex items-center flex-col md:flex-row justify-center min-h-screen w-full bg-muted text-foreground overflow-y-auto p-4">
            <Card className="flex flex-col md:flex-row w-full max-w-[85vw] sm:max-w-[80vw] md:max-w-[40vw] lg:max-w-[40vw] xl:max-w-[40vw] 2xl:max-w-[40vw] rounded-2xl overflow-hidden shadow-xl border border-border p-0 gap-0">
                <CardContent className="w-full flex flex-col justify-center bg-background p-6 sm:p-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Reset Password</h2>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* New Password */}
                        <div className="flex flex-col items-start">
                            <label className="block text-sm font-medium mb-2" htmlFor="password">
                                New Password
                            </label>
                            <div className="relative w-full">
                                <Input
                                    id="password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    className="w-full pr-10 text-sm"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {newPassword && (
                                <div className="mt-3 space-y-2 text-xs">
                                    <p className="font-medium text-muted-foreground mb-1">Password must contain:</p>
                                    <PasswordRequirement 
                                        met={passwordChecks.minLength} 
                                        text="At least 8 characters" 
                                    />
                                    <PasswordRequirement 
                                        met={passwordChecks.hasUpperCase} 
                                        text="One uppercase letter (A-Z)" 
                                    />
                                    <PasswordRequirement 
                                        met={passwordChecks.hasLowerCase} 
                                        text="One lowercase letter (a-z)" 
                                    />
                                    <PasswordRequirement 
                                        met={passwordChecks.hasNumber} 
                                        text="One number (0-9)" 
                                    />
                                    <PasswordRequirement 
                                        met={passwordChecks.hasSpecialChar} 
                                        text="One special character (!@#$%^&*...)" 
                                    />
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col items-start">
                            <label className="block text-sm font-medium mb-2" htmlFor="confirm_password">
                                Confirm Password
                            </label>
                            <div className="relative w-full">
                                <Input
                                    id="confirm_password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    className="w-full pr-10 text-sm"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {confirm && newPassword !== confirm && (
                                <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                                    <X size={14} /> Passwords do not match
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            className="w-full font-medium text-white" 
                            disabled={loading || !allChecksPassed || newPassword !== confirm}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>

                        <Button 
                            type="button" 
                            variant="link" 
                            onClick={() => navigate('/login')}
                            className="w-full"
                        >
                            Back to Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper component for password requirements
function PasswordRequirement({ met, text }) {
    return (
        <div className={`flex items-center gap-2 ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
            {met ? <Check size={14} /> : <X size={14} />}
            <span>{text}</span>
        </div>
    );
}
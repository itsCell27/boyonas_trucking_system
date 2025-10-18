import { useState } from 'react';
import { Truck, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost/react_trucking_system/backend/api/login.php', {
                method: 'POST',
                credentials: 'include', // ADD THIS LINE
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                console.log('Login successful:', data.user);
                
                if (data.user.role_name === 'admin') {
                    // Set authentication BEFORE navigating
                    localStorage.setItem("isAuthenticated", "true");
                    console.log('Auth set:', localStorage.getItem("isAuthenticated"));
                    
                    // Use replace to avoid back button issues
                    navigate('/app/dashboard', { replace: true });
                } else {
                    // Handle other roles here
                    setError('Only admin users can access this system.');
                }
            } else {
                setError(data.message || 'An unknown error occurred.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Failed to connect to the server.');
        }
    };

    return (
        <div className="bg-gray-100 flex justify-center items-center h-screen font-geist">
            <div className="flex bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full mx-4 sm:mx-0">
                <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-primary p-8 text-white text-center">
                    <Truck size={80} />
                    <h1 className="text-2xl font-bold mt-4">Boyonas Trucking Service System</h1>
                </div>
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-primary text-center mb-6">Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                required 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" 
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-4 relative">
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                id="password" 
                                name="password" 
                                required 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button"
                                onClick={togglePasswordVisibility} 
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 top-7"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <div className="mb-6 text-right">
                            {/* <a href="#" className="text-sm text-primary hover:underline">Forgot Password?</a> */}
                        </div>
                        <button type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:bg-[#001744] transition-colors duration-300">Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
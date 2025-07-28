import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Input } from "../components/ui/input";
import { addPasswordToAccount } from "../services/authService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Toaster } from "react-hot-toast";
import { handleError, handleSuccess } from "../lib/handleResponse";

const SetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState("");

    useEffect(() => {
        const t = searchParams?.get('token');
        if (t) {
            setToken(t);
            try {
                const decoded = jwtDecode(t);
                setUser(decoded);
            } catch (err) {
                console.error("Invalid token", err);
            }
        }
    }, [searchParams]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        if (password.length < 6) {
            return setError("Password must be at least 6 characters");
        }

        setIsLoading(true);
        try {
            const result = await addPasswordToAccount(password, token);
            if (result?.data?.success) {
                handleSuccess(result?.data?.message || "Password Reset Successfully");
                localStorage.setItem('authToken', token);
                setTimeout(() => {
                    navigate('/dashboard')
                }, 2000);
            } else {
                return handleError(result?.data?.message || "Failed to Reset Password");
            }
        } catch (err) {
            setError(err?.message || "Failed to set password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Set a Password</h2>
            <p className="mb-4 text-sm text-gray-600">
                Hello {user?.name || user?.email}, please set a password to enable email login.
            </p>

            {error && <p className="text-red-600 mb-2">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg transition-all duration-150 hover:bg-blue-700 hover:scale-[1.03] disabled:opacity-60 hover:cursor-pointer"
                >
                    {isLoading ? "Saving..." : "Set Password"}
                </Button>
            </form>
            <Toaster />
        </div>
    );
};

export default SetPasswordPage;

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            // Validation
            if (!formData.password || !formData.confirmPassword) {
                setError("Both password fields are required");
                setLoading(false);
                return;
            }

            if (formData.password.length < 6) {
                setError("Password must be at least 6 characters");
                setLoading(false);
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                setLoading(false);
                return;
            }

            const response = await API.post(`/auth/reset-password/${token}`, {
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            setMessage(response.data.message);
            setSuccess(true);
            setFormData({ password: "", confirmPassword: "" });

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to reset password. Please try again.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center p-5 bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
                    Create New Password
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Enter your new password below
                </p>

                {success ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-800 font-semibold">✓ Success!</p>
                        <p className="text-green-700 text-sm mt-2">
                            {message} You'll be redirected to login shortly.
                        </p>
                    </div>
                ) : null}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 font-semibold">Error</p>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                )}

                {message && !success && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 text-sm">{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter new password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading || success}
                            minLength={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            required
                        />
                        <p className="text-gray-500 text-xs mt-1">Minimum 6 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading || success}
                            minLength={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full bg-blue-950 text-white py-2 rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Resetting..." : success ? "Password Reset" : "Reset Password"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        <Link to="/login" className="text-blue-950 font-semibold hover:underline">
                            Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            if (!email || !email.includes("@")) {
                setError("Please enter a valid email address");
                setLoading(false);
                return;
            }

            const response = await API.post("/auth/forgot-password", { email });
            setMessage(response.data.message);
            setEmail("");
            setSubmitted(true);

            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to send reset email. Please try again.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center p-5 bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
                    Forgot Password?
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Enter your email and we'll send you a link to reset your password.
                </p>

                {submitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-800 font-semibold">✓ Email sent successfully!</p>
                        <p className="text-green-700 text-sm mt-2">
                            Check your email for the password reset link. You'll be redirected to login shortly.
                        </p>
                    </div>
                ) : null}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 font-semibold">Error</p>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                )}

                {message && !submitted && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 text-sm">{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading || submitted}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || submitted}
                        className="w-full bg-blue-950 text-white py-2 rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Sending..." : submitted ? "Email Sent" : "Send Reset Link"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Remember your password?{" "}
                        <Link to="/login" className="text-blue-950 font-semibold hover:underline">
                            Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

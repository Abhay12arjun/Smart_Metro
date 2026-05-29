import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const res = await API.post("/auth/forgot-password", { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Password reset request failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center p-5">
            <form
                onSubmit={submitHandler}
                className="bg-white p-8 rounded-xl shadow w-96"
            >
                <h2 className="text-3xl font-bold mb-3 text-center">
                    Reset Password
                </h2>

                <p className="text-gray-600 mb-5 text-center">
                    Enter your passenger email to receive a reset link.
                </p>

                {message && (
                    <p className="bg-green-100 text-green-700 p-3 mb-3 rounded">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="bg-red-100 text-red-600 p-3 mb-3 rounded">
                        {error}
                    </p>
                )}

                <input
                    className="border p-3 w-full mb-4 rounded"
                    placeholder="Passenger Email"
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    disabled={loading}
                    className="bg-blue-950 text-white p-3 w-full rounded"
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <p className="mt-4 text-center">
                    Remembered it?{" "}
                    <Link to="/login" className="text-blue-700 font-bold">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default ForgotPassword;

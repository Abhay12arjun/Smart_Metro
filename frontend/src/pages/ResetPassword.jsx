import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const res = await API.post(`/auth/reset-password/${token}`, {
                password
            });
            setMessage(res.data.message);
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Password reset failed");
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
                <h2 className="text-3xl font-bold mb-5 text-center">
                    Create New Password
                </h2>

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
                    className="border p-3 w-full mb-3 rounded"
                    placeholder="New Password"
                    type="password"
                    value={password}
                    minLength={6}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    className="border p-3 w-full mb-4 rounded"
                    placeholder="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    minLength={6}
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                    disabled={loading}
                    className="bg-blue-950 text-white p-3 w-full rounded"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>

                <p className="mt-4 text-center">
                    <Link to="/login" className="text-blue-700 font-bold">
                        Back to login
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default ResetPassword;
